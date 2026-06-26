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
      conflicts: conflicts(resolution[:resolved]),
      out_of_range: out_of_range(resolution[:resolved])
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
    table
  end

  def guard_no_duplicate_components!
    names = @components.map { |c| c[:name] }
    return if names.uniq.length == names.length

    raise ImportError, { message: 'duplicate_component_name' }
  end

  def guard_header!(headers)
    expected = [identifier_header] + @components.map { |c| c[:name] }
    return if headers == expected

    raise ImportError, { message: 'bad_header', expected: expected, got: headers }
  end

  def identifier_header
    (@identifier_mode == 'email') ? 'Email' : 'External ID'
  end

  def roster_lookup
    @roster_lookup ||=
      if @identifier_mode == 'email'
        @course.course_users.includes(:user).index_by { |cu| cu.user.email.downcase }
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
      resolved << { course_user: course_user, identifier: identifier, grades: grades }
    end
    { resolved: resolved, unresolved: unresolved.uniq, malformed: malformed }
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
          kind: grade < 0 ? 'below' : 'above'
        }
      end
    end
    cells
  end

  def sample(resolved)
    resolved.first(5).map do |r|
      { studentName: r[:course_user].name, grades: r[:grades] }
    end
  end

  def conflicts(resolved)
    result = []
    @components.each do |component|
      conflicts_for_component(component, resolved, result)
    end
    result
  end

  def conflicts_for_component(component, resolved, result)
    external = existing_external(component[:name])
    return unless external

    grade_by_cu = external.external_assessment_grades.index_by(&:course_user_id)
    resolved.each do |row|
      conflict = conflict_entry(component[:name], row, grade_by_cu)
      result << conflict if conflict
    end
  end

  def conflict_entry(component_name, row, grade_by_cu)
    in_file = row[:grades][component_name]
    return nil if in_file.nil?

    existing = grade_by_cu[row[:course_user].id]
    return nil if existing.nil? || existing.grade.nil?

    {
      component: component_name,
      studentName: row[:course_user].name,
      existingGrade: existing.grade.to_f,
      inFileGrade: in_file,
      identifierMismatch: existing.imported_identifier.present? &&
        existing.imported_identifier != row[:identifier]
    }
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
    grade_by_cu = external.external_assessment_grades.index_by(&:course_user_id)
    written = 0
    resolved.each do |row|
      written += upsert_one(grade_by_cu, component, row, on_conflict)
    end
    written
  end

  def upsert_one(grade_by_cu, component, row, on_conflict)
    in_file = row[:grades][component[:name]]
    return 0 if in_file.nil?

    existing = grade_by_cu[row[:course_user].id]
    if existing.nil?
      bulk_insert([build_grade(existing_external(component[:name]), row, value: in_file)])
      1
    elsif on_conflict.to_s == 'replace' || existing.grade.nil?
      User.with_stamper(@actor) do
        existing.update!(grade: in_file, imported_identifier: row[:identifier])
      end
      1
    else
      0
    end
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
