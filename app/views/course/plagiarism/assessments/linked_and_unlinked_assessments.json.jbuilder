# frozen_string_literal: true
json.linkedAssessments @linked_assessments do |assessment|
  json.id assessment.id
  json.title assessment.title
  json.courseId assessment.course_id
  json.courseTitle assessment.course_title
  json.url course_assessment_path(assessment.course_id, assessment.id)
  json.canManage @can_manage_assessment_hash[assessment.id]
end

json.unlinkedAssessments @unlinked_assessments do |assessment|
  json.id assessment.id
  json.title assessment.title
  json.courseId assessment.course.id
  json.courseTitle assessment.course.title
  json.url course_assessment_path(assessment.course_id, assessment.id)
  json.canManage @can_manage_assessment_hash[assessment.id]
end
