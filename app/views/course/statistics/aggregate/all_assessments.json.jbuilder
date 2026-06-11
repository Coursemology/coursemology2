# frozen_string_literal: true
json.numStudents @all_students.size

json.assessments @assessments do |assessment|
  grade_stats = @grades_hash.fetch(assessment.id, nil)
  duration_stats = @durations_hash.fetch(assessment.id, nil)

  json.id assessment.id
  json.title assessment.title
  json.startAt assessment.start_at&.iso8601

  json.tab do
    json.id assessment.tab_id
    json.title assessment.tab.title
  end

  json.category do
    json.id assessment.tab.category_id
    json.title assessment.tab.category.title
  end

  json.maximumGrade @max_grades_hash[assessment.id] || 0

  if grade_stats.present?
    json.averageGrade grade_stats[0]
    json.stdevGrade grade_stats[1]
  end

  if duration_stats.present?
    json.averageTimeTaken duration_stats[0]
    json.stdevTimeTaken duration_stats[1]
  end

  json.numSubmitted @num_submitted_students_hash[assessment.id] || 0
  json.numAttempted @num_attempted_students_hash[assessment.id] || 0
  json.numLate @num_late_students_hash[assessment.id] || 0
end

json.gradebookEnabled current_course.component_enabled?(Course::GradebookComponent) &&
                      can?(:read_gradebook, current_course)
