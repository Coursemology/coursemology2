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

  BLANKISH = ['', '-', '–', '—'].freeze

  # rubocop:disable Metrics/ParameterLists -- mirrors the controller's request shape; named kwargs are clearer than a struct
  def initialize(course:, actor:, identifier_mode:, identifier_column:, csv_data:, mappings:)
    @course = course
    @actor = actor
    @identifier_mode = identifier_mode.to_s
    @identifier_column = identifier_column.to_s
    @csv_data = csv_data
    @mappings = mappings.map(&:symbolize_keys)
  end
  # rubocop:enable Metrics/ParameterLists

  def targets
    @mappings.map { |m| m[:target] }
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
    @mappings.each do |mapping|
      if mapping[:action] == 'existing'
        external = existing_external(mapping[:target])
        summary[:updatedComponents] += 1
        summary[:gradesWritten] += upsert_grades(external, mapping, resolved,
                                                 on_conflict: on_conflict)
      else
        summary[:createdComponents] += 1
        summary[:gradesWritten] += create_component(mapping, resolved)
      end
    end
  end

  def parsed_rows
    table = CSV.parse(@csv_data.to_s, headers: true)
    guard_header!(table.headers)
    guard_targets!
    guard_not_empty!(table)
    guard_unique_identifiers!(table)
    table
  end

  def guard_header!(headers)
    present = headers.compact
    guard_identifier_column_present!(present)
    guard_mapped_headers_present!(present)
    guard_no_duplicate_headers!(present)
  end

  def guard_identifier_column_present!(present)
    return if present.include?(@identifier_column)

    raise ImportError, { message: 'bad_header', missing: [@identifier_column] }
  end

  def guard_mapped_headers_present!(present)
    missing = @mappings.map { |m| m[:header] }.reject { |h| present.include?(h) }
    raise ImportError, { message: 'bad_header', missing: missing } if missing.any?
  end

  def guard_no_duplicate_headers!(present)
    mapped_or_identifier = present.select { |h| h == @identifier_column || @mappings.any? { |m| m[:header] == h } }
    dupes = duplicate_headers(mapped_or_identifier)
    raise ImportError, { message: 'bad_header', duplicates: dupes } if dupes.any?
  end

  # Defensive backend counterpart to the frontend's own collision guards: two
  # "create" mappings cannot share a target, nor may a "create" target collide
  # with an existing assessment's title (both case-insensitive).
  def guard_targets!
    create_targets = @mappings.select { |m| m[:action] == 'create' }.map { |m| m[:target] }
    dupes = duplicate_targets(create_targets)
    collisions = colliding_targets(create_targets)
    return if dupes.empty? && collisions.empty?

    raise ImportError, { message: 'duplicate_target', duplicates: dupes, collisions: collisions }
  end

  def duplicate_targets(create_targets)
    create_targets.group_by(&:downcase).select { |_key, group| group.size > 1 }.keys
  end

  def colliding_targets(create_targets)
    existing_titles = Course::ExternalAssessment.for_course(@course).pluck(:title)
    create_targets.select { |target| existing_titles.any? { |title| title.casecmp?(target) } }
  end

  def guard_not_empty!(table)
    return unless table.empty?

    raise ImportError, { message: 'empty_csv' }
  end

  def guard_unique_identifiers!(table)
    keys = table.filter_map do |row|
      key = lookup_key(row[@identifier_column].to_s.strip)
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
      identifier = row[@identifier_column].to_s.strip
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
    @mappings.each do |m|
      raw = row[m[:header]]
      key = m[:target]
      if blankish?(raw)
        grades[key] = nil
      elsif numeric?(raw)
        grades[key] = Float(raw)
      else
        malformed << "row #{row_idx + 2}, #{m[:header]}: #{raw}"
      end
    end
    [grades, malformed]
  end

  def blankish?(raw)
    s = raw.to_s.strip
    raw.nil? || BLANKISH.include?(s) || s.match?(/\An\/?a\z/i)
  end

  def numeric?(value)
    Float(value)
    true
  rescue ArgumentError, TypeError
    false
  end

  # Advisory: grades outside [0, max]. Reported but never blocks the import.
  def out_of_range(resolved)
    resolved.each_with_object([]) do |row, cells|
      @mappings.each { |m| out_of_range_cell(row, m)&.tap { |cell| cells << cell } }
    end
  end

  def mapping_max(mapping)
    (mapping[:action] == 'existing') ? existing_external(mapping[:target]).maximum_grade : (mapping[:max_grade] || 100)
  end

  def out_of_range_cell(row, mapping)
    grade = row[:grades][mapping[:target]]
    return if grade.nil?

    max = mapping_max(mapping)
    return unless grade < 0 || grade > max

    { identifier: row[:identifier], component: mapping[:target], grade: grade, max: max,
      kind: (grade < 0) ? 'below' : 'above' }
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

  # Mapping targets, one per mapping, in the order the mappings were given.
  # The frontend builds mappings in the order columns appear in the uploaded
  # CSV, so this is effectively the CSV column order restricted to mapped
  # (non-ignored) columns. We key by target (the gradebook component name), not
  # the CSV header, so the preview labels match the gradebook and align with the
  # grades/conflict hashes (both keyed by target) — a header-keyed order renders
  # renamed columns blank.
  def column_order(_table)
    @mappings.map { |m| m[:target] }
  end

  def conflict_rows(resolved)
    grades_by_target = @mappings.to_h do |m|
      external = existing_external(m[:target])
      grades = external ? external.external_assessment_grades.index_by(&:course_user_id) : {}
      [m[:target], grades]
    end

    resolved.filter_map { |row| build_conflict_row(row, grades_by_target) }
  end

  def build_conflict_row(row, grades_by_target)
    cells = {}
    changed_any = false

    @mappings.each do |m|
      cell, changed = conflict_cell(m, row, grades_by_target)
      changed_any ||= changed
      cells[m[:target]] = cell
    end

    return nil unless changed_any

    { identifier: row[:identifier], studentName: row[:course_user].name, cells: cells }
  end

  def conflict_cell(mapping, row, grades_by_target)
    target = mapping[:target]
    in_file = row[:grades][target]
    existing_record = grades_by_target[target][row[:course_user].id]
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

  def create_component(mapping, resolved)
    external = User.with_stamper(@actor) do
      Course::ExternalAssessment.create_for_course!(
        course: @course, title: mapping[:target],
        maximum_grade: mapping[:max_grade] || 100, weight: mapping[:weight] || 0
      )
    end
    rows = resolved.filter_map do |r|
      build_grade(external, r) unless r[:grades][mapping[:target]].nil?
    end
    bulk_insert(rows)
    rows.size
  end

  def upsert_grades(external, mapping, resolved, on_conflict:)
    inserts, upserts = partition_grade_writes(
      external, mapping[:target], resolved, on_conflict
    )

    bulk_insert(inserts)
    bulk_upsert(upserts)

    inserts.size + upserts.size
  end

  def partition_grade_writes(external, target, resolved, on_conflict)
    context = {
      external: external,
      component_name: target,
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
