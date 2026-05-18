# frozen_string_literal: true
tabs = @published_assessments.map(&:tab).uniq(&:id)

json.tabs tabs do |tab|
  json.id tab.id
  json.title tab.title
end

json.assessments @published_assessments do |assessment|
  json.id assessment.id
  json.title assessment.title
  json.tabId assessment.tab_id
  json.maxGrade @assessment_max_grades[assessment.id] || 0.0
end

json.students @students do |course_user|
  user_id = course_user.user_id
  total_grade = 0.0
  total_max_grade = 0.0
  grades = {}

  @published_assessments.each do |assessment|
    grade = @student_assessment_grades[[user_id, assessment.id]] || 0.0
    grades[assessment.id] = grade
    total_grade += grade
    total_max_grade += @assessment_max_grades[assessment.id] || 0.0
  end

  json.id course_user.id
  json.name course_user.name
  json.grades grades
  json.totalGrade total_grade
  json.totalMaxGrade total_max_grade
end
