# frozen_string_literal: true
json.numStudents @all_students.size

json.assessments @assessments do |assessment|
  grade_stats = @grades_hash[assessment.id] || [0, 0]
  duration_stats = @durations_hash[assessment.id] || [0, 0]

  json.id assessment.id
  json.title assessment.title

  json.tab do
    json.id assessment.tab_id
    json.title assessment.tab.title
  end

  json.category do
    json.id assessment.tab.category_id
    json.title assessment.tab.category.title
  end

  json.maximumGrade assessment.maximum_grade

  json.averageGrade grade_stats ? grade_stats[0] : 0
  json.stdevGrade grade_stats ? grade_stats[1] : 0

  json.averageTimeTaken seconds_to_str(duration_stats[0])
  json.stdevTimeTaken seconds_to_str(duration_stats[1])

  json.numSubmitted @num_submitted_students_hash[assessment.id] || 0
  json.numAttempting @num_attempting_students_hash[assessment.id] || 0
  json.numLate @num_late_students_hash[assessment.id] || 0
end
