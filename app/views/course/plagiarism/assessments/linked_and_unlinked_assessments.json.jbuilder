# frozen_string_literal: true
json.linkedAssessments @linked_assessments do |assessment|
  json.id assessment.id
  json.title assessment.title
  json.courseId assessment.course.id
  json.courseTitle assessment.course.title
  json.url course_assessment_path(assessment.course, assessment)
  json.canManage @can_manage_course_hash[assessment.course.id]
end

json.unlinkedAssessments @unlinked_assessments do |assessment|
  json.id assessment.id
  json.title assessment.title
  json.courseId assessment.course.id
  json.courseTitle assessment.course.title
  json.url course_assessment_path(assessment.course, assessment)
  json.canManage @can_manage_course_hash[assessment.course.id]
end
