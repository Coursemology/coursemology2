# frozen_string_literal: true
require 'csv'

class Course::Gradebook::ExternalAssessmentImportService # rubocop:disable Metrics/ClassLength
  class ImportError < StandardError
    attr_reader :payload

    def initialize(payload)
      @payload = payload
      super(payload.is_a?(Hash) ? payload[:message].to_s : payload.to_s)
    end
  end

  HEADER_SUGGESTION_MAX_DISTANCE = 2

  def initialize(course:, actor:, components:, identifier_mode:, csv_data:)
    @course = course
    @actor = actor
    @components = components.map(&:symbolize_keys)
    @identifier_mode = identifier_mode.to_s
    @csv_data = csv_data
  end

  def preview
    rows = parsed_rows
    resolution = resolve(rows)
    {
      ok: resolution[:unresolved].empty? && resolution[:malformed].empty?,
      unresolved: resolution[:unresolved],
      malformed: resolution[:malformed],
      sample: sample(resolution[:resolved]),
      conflict_rows: conflict_rows(resolution[:resolved]),
      out_of_range: out_of_range(resolution[:resolved]),
      reassignments: reassignments(resolution[:resolved]),
      total_rows: resolution[:resolved].size,
      column_order: column_order(rows)
    }
  end

  def commit(on_conflict:)
    rows = parsed_rows
    resolution = resolve(rows)
    unless resolution[:unresolved].empty? && resolution[:malformed].empty?
      raise ImportError, { message: 'validation_failed',
                           unresolved: resolution[:unresolved],
                           malformed: resolution[:malformed] }
    end

    summary = { createdComponents: 0, updatedComponents: 0, gradesWritten: 0 }
    ActiveRecord::Base.transaction { write_components(summary, resolution[:resolved], on_conflict) }
    summary
  end

  private

  def write_components(summary, resolved, on_conflict)
    @components.each do |component|
      external = existing_external(component[:name])
      if external
        summary[:updatedComponents] += 1
        summary[:gradesWritten] += upsert_grades(external, component, resolved,
                                                 on_conflict: on_conflict)
      else
        summary[:createdComponents] += 1
        summary[:gradesWritten] += create_component(component, resolved)
      end
    end
  end

  def parsed_rows
    guard_no_duplicate_components!
    table = CSV.parse(@csv_data.to_s, headers: true)
    guard_header!(table.headers)
    guard_not_empty!(table)
    guard_unique_identifiers!(table)
    table
  end

  def guard_no_duplicate_components!
    names = @components.map { |c| c[:name] }
    return if names.uniq.length == names.length

    raise ImportError, { message: 'duplicate_component_name' }
  end

  def guard_header!(headers)
    expected = [identifier_header] + @components.map { |c| c[:name] }
    identifier_not_first = headers.include?(identifier_header) &&
                           headers.compact.first != identifier_header
    return if headers.tally == expected.tally && !identifier_not_first

    suggestions = header_suggestions(expected, headers)
    raise ImportError, { message: 'bad_header',
                         missing: missing_headers(expected, headers, suggestions),
                         unrecognized: unrecognized_headers(expected, headers, suggestions),
                         suggestions: suggestions,
                         duplicates: duplicate_headers(headers),
                         identifierNotFirst: identifier_not_first }
  end

  def guard_not_empty!(table)
    return unless table.empty?

    raise ImportError, { message: 'empty_csv' }
  end

  def guard_unique_identifiers!(table)
    keys = table.filter_map do |row|
      key = lookup_key(row[identifier_header].to_s.strip)
      key unless key.empty?
    end
    duplicates = keys.tally.select { |_key, count| count > 1 }.keys
    return if duplicates.empty?

    raise ImportError, { message: 'duplicate_identifier', identifiers: duplicates }
  end

  # Headers that appear more than once in the uploaded file, with their counts.
  def duplicate_headers(headers)
    headers.compact.tally.select { |_name, count| count > 1 }.
      map { |name, count| { name: name, count: count } }
  end

  # Expected columns absent from the upload. A column we can pair to a likely
  # typo'd upload is reported via suggestions ("did you mean"), not here.
  def missing_headers(expected, headers, suggestions)
    (expected - headers) - suggestions.map { |s| s[:expected] }
  end

  # Uploaded columns that are not expected. The upload side of a typo pair is
  # reported via suggestions, so it is excluded here.
  def unrecognized_headers(expected, headers, suggestions)
    (headers.compact.uniq - expected) - suggestions.map { |s| s[:didYouMean] }
  end

  # For each expected header absent from the uploaded file, suggest the closest
  # *unused* uploaded header within HEADER_SUGGESTION_MAX_DISTANCE edits (catches
  # typos and singular/plural, e.g. required "Midterms" vs uploaded "Midterm").
  def header_suggestions(expected, got)
    available = (got - expected).compact
    (expected - got).filter_map do |want|
      near = available.min_by { |have| levenshtein(want, have) }
      next if near.nil? || levenshtein(want, near) > HEADER_SUGGESTION_MAX_DISTANCE

      available.delete(near) # never suggest the same uploaded column twice
      { expected: want, didYouMean: near }
    end
  end

  def levenshtein(source, target)
    return target.length if source.empty?
    return source.length if target.empty?

    distances = (0..target.length).to_a

    source.each_char.with_index(1) do |source_char, source_index|
      distances = next_levenshtein_row(
        distances,
        target,
        source_char,
        source_index
      )
    end

    distances[target.length]
  end

  def next_levenshtein_row(previous, target, source_char, source_index)
    current = [source_index]

    target.each_char.with_index(1) do |target_char, target_index|
      current << levenshtein_cell(
        previous,
        current,
        source_char,
        target_char,
        target_index
      )
    end

    current
  end

  def levenshtein_cell(previous, current, source_char, target_char, target_index)
    substitution_cost = (source_char == target_char) ? 0 : 1

    [
      previous[target_index] + 1,
      current[target_index - 1] + 1,
      previous[target_index - 1] + substitution_cost
    ].min
  end

  def identifier_header
    (@identifier_mode == 'email') ? 'Email' : 'External ID'
  end

  def roster_lookup
    @roster_lookup ||=
      if @identifier_mode == 'email'
        @course.course_users.includes(user: :emails).index_by { |cu| cu.user.email.downcase }
      else
        @course.course_users.where.not(external_id: [nil, '']).index_by(&:external_id)
      end
  end

  def lookup_key(identifier)
    (@identifier_mode == 'email') ? identifier.to_s.downcase : identifier.to_s
  end

  def resolve(table)
    resolved = []
    unresolved = []
    malformed = []
    table.each_with_index do |row, idx|
      identifier = row[identifier_header].to_s.strip
      course_user = roster_lookup[lookup_key(identifier)]
      if course_user.nil?
        unresolved << identifier
        next
      end
      grades, bad = parse_grades(row, idx)
      malformed.concat(bad)
      resolved << { course_user: course_user, identifier: normalized_email(identifier, course_user), grades: grades }
    end
    { resolved: resolved, unresolved: unresolved.uniq, malformed: malformed }
  end

  def normalized_email(identifier, course_user)
    return course_user.user.email if @identifier_mode == 'email' && course_user&.user&.email.present?

    identifier
  end

  def parse_grades(row, row_idx)
    grades = {}
    malformed = []
    @components.each do |component|
      raw = row[component[:name]]
      if raw.nil? || raw.to_s.strip.empty?
        grades[component[:name]] = nil
      elsif numeric?(raw)
        grades[component[:name]] = Float(raw)
      else
        malformed << "row #{row_idx + 2}, #{component[:name]}: #{raw}"
      end
    end
    [grades, malformed]
  end

  def numeric?(value)
    Float(value)
    true
  rescue ArgumentError, TypeError
    false
  end

  # Advisory: grades outside [0, max]. Reported but never blocks the import.
  def out_of_range(resolved)
    cells = []
    resolved.each do |row|
      @components.each do |component|
        grade = row[:grades][component[:name]]
        next if grade.nil?

        max = component[:maximum_grade]
        next unless grade < 0 || grade > max

        cells << {
          identifier: row[:identifier],
          component: component[:name],
          grade: grade,
          max: max,
          kind: (grade < 0) ? 'below' : 'above'
        }
      end
    end
    cells
  end

  # A row is "reassigned" when its CSV identifier was previously imported as the
  # binding key for a grade now owned by a DIFFERENT course_user — i.e. the
  # identifier has changed hands (e.g. an External ID recycled to a new student).
  # Resolution still binds by course_user_id, so the grade is placed on whoever
  # currently owns the identifier; this advisory asks the user to confirm that is
  # the intended person. Unlike a conflict row it can fire on a brand-new insert,
  # so it is surfaced standalone, not via the conflict table. One entry per
  # identifier. Naturally silent on benign same-student drift and on mode switches
  # (an email never equals a stored External ID).
  def reassignments(resolved)
    owners = snapshot_owners
    return [] if owners.empty?

    raw = collect_reassignments(resolved, owners)
    names = course_user_names(raw.flat_map { |entry| entry[:previous_ids] })
    raw.map do |entry|
      { identifier: entry[:identifier], currentStudent: entry[:current_student],
        previousStudents: entry[:previous_ids].filter_map { |id| names[id] } }
    end
  end

  # One reassignment entry per identifier whose grade is now owned by a different
  # course_user than the resolved row. Dedups by identifier, marking it seen only
  # once a genuine reassignment is found so the first such row wins.
  def collect_reassignments(resolved, owners)
    seen = Set.new
    resolved.filter_map do |row|
      incoming = row[:identifier]
      others = owners.fetch(incoming, []).reject { |cu_id| cu_id == row[:course_user].id }
      next if others.empty? || !seen.add?(incoming)

      { identifier: incoming, current_student: row[:course_user].name, previous_ids: others }
    end
  end

  # { imported_identifier => Set[course_user_id] } across all of the course's
  # external grades. Two different course_users can share one snapshot value
  # (a stale grade plus a fresh one) — that overlap is exactly the reassignment.
  def snapshot_owners
    @snapshot_owners ||=
      Course::ExternalAssessmentGrade.
      joins(:external_assessment).
      where(course_external_assessments: { course_id: @course.id }).
      where.not(imported_identifier: [nil, '']).
      pluck(:imported_identifier, :course_user_id).
      each_with_object({}) { |(ident, cu_id), acc| (acc[ident] ||= Set.new) << cu_id }
  end

  def course_user_names(ids)
    return {} if ids.empty?

    CourseUser.where(id: ids.uniq).pluck(:id, :name).to_h
  end

  def sample(resolved)
    resolved.first(5).map do |r|
      { identifier: r[:identifier], grades: r[:grades] }
    end
  end

  # Component column headers in the order they appear in the uploaded CSV,
  # with the identifier header removed. guard_header! has already ensured the
  # header set matches @components, so the remainder are exactly the component
  # names in CSV order.
  def column_order(table)
    table.headers.compact - [identifier_header]
  end

  def conflict_rows(resolved)
    grades_by_component = @components.to_h do |component|
      external = existing_external(component[:name])
      grades = external ? external.external_assessment_grades.index_by(&:course_user_id) : {}
      [component[:name], grades]
    end

    resolved.filter_map { |row| build_conflict_row(row, grades_by_component) }
  end

  def build_conflict_row(row, grades_by_component)
    cells = {}
    changed_any = false

    @components.each do |component|
      cell, changed = conflict_cell(component, row, grades_by_component)
      changed_any ||= changed
      cells[component[:name]] = cell
    end

    return nil unless changed_any

    { identifier: row[:identifier], studentName: row[:course_user].name, cells: cells }
  end

  def conflict_cell(component, row, grades_by_component)
    name = component[:name]
    in_file = row[:grades][name]
    existing_record = grades_by_component[name][row[:course_user].id]
    existing = existing_record&.grade
    changed = grade_changed?(existing, in_file)
    [{ existing: existing&.to_f, inFile: in_file, changed: changed }, changed]
  end

  def grades_comparable?(existing, in_file)
    !existing.nil? && !in_file.nil?
  end

  def grade_changed?(existing, in_file)
    grades_comparable?(existing, in_file) && existing.to_f.round(2) != in_file.to_f.round(2)
  end

  def existing_external(name)
    @existing_externals ||= {}
    @existing_externals[name] ||= Course::ExternalAssessment.for_course(@course).find_by(title: name)
  end

  def create_component(component, resolved)
    external = User.with_stamper(@actor) do
      Course::ExternalAssessment.create_for_course!(
        course: @course, title: component[:name],
        maximum_grade: component[:maximum_grade], weight: component[:weightage]
      )
    end
    rows = resolved.filter_map do |r|
      build_grade(external, r) unless r[:grades][component[:name]].nil?
    end
    bulk_insert(rows)
    rows.size
  end

  def upsert_grades(external, component, resolved, on_conflict:)
    inserts, upserts = partition_grade_writes(
      external, component[:name], resolved, on_conflict
    )

    bulk_insert(inserts)
    bulk_upsert(upserts)

    inserts.size + upserts.size
  end

  def partition_grade_writes(external, component_name, resolved, on_conflict)
    context = {
      external: external,
      component_name: component_name,
      existing_by_cu: external.external_assessment_grades.index_by(&:course_user_id)
    }

    if on_conflict.to_s == 'replace'
      collect_replace_grade_writes(resolved, context)
    else
      collect_keep_grade_writes(resolved, context)
    end
  end

  def collect_replace_grade_writes(resolved, context)
    resolved.each_with_object({ inserts: [], upserts: [] }) do |row, buckets|
      existing, record = grade_write_for(row, context)
      next if record.nil?

      if existing.nil?
        buckets[:inserts] << record
      else
        buckets[:upserts] << record
      end
    end.values_at(:inserts, :upserts)
  end

  def collect_keep_grade_writes(resolved, context)
    resolved.each_with_object({ inserts: [], upserts: [] }) do |row, buckets|
      existing, record = grade_write_for(row, context)
      next if record.nil?

      if existing.nil?
        buckets[:inserts] << record
      elsif existing.grade.nil?
        buckets[:upserts] << record
      end
    end.values_at(:inserts, :upserts)
  end

  def grade_write_for(row, context)
    in_file = row[:grades][context[:component_name]]
    return if in_file.nil?

    existing = context[:existing_by_cu][row[:course_user].id]
    record = build_grade(context[:external], row, value: in_file)

    [existing, record]
  end

  # Bulk update via Postgres ON CONFLICT. Only the listed columns are written on
  # conflict, so creator_id/created_at on the existing row are preserved; grade,
  # imported_identifier, updater_id and updated_at are refreshed. validate:false
  # because the rows already exist (the uniqueness validation would reject them)
  # and grades were already coerced to Float during parsing.
  def bulk_upsert(records)
    return if records.empty?

    Course::ExternalAssessmentGrade.import(
      records,
      validate: false,
      on_duplicate_key_update: {
        conflict_target: [:external_assessment_id, :course_user_id],
        columns: [:grade, :imported_identifier, :updater_id, :updated_at]
      }
    )
  end

  def build_grade(external, resolved_row, value: nil)
    Course::ExternalAssessmentGrade.new(
      external_assessment: external,
      course_user: resolved_row[:course_user],
      grade: value.nil? ? resolved_row[:grades][external.title] : value,
      imported_identifier: resolved_row[:identifier],
      creator: @actor, updater: @actor
    )
  end

  def bulk_insert(records)
    return if records.empty?

    Course::ExternalAssessmentGrade.import(records, validate: true)
  end
end
