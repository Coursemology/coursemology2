# frozen_string_literal: true
json.categories @categories do |cat|
  json.id cat.id
  json.title cat.title
end

json.tabs @tabs do |tab|
  json.id tab.id
  json.title tab.title
  json.categoryId tab.category_id
end

json.assessments @published_assessments do |assessment|
  json.id assessment.id
  json.title assessment.title
  json.tabId assessment.tab_id
  json.maxGrade @assessment_max_grades[assessment.id] || 0
end

json.students @students do |course_user|
  json.id course_user.user_id
  json.name course_user.name
  json.email course_user.user.email
  json.externalId course_user.external_id
  json.level course_user.level_number
  json.totalXp course_user.experience_points
end

json.submissions @submissions do |sub|
  json.studentId sub.student_id
  json.assessmentId sub.assessment_id
  json.submissionId sub.submission_id
  json.grade sub.grade&.to_f
end

json.gamificationEnabled current_course.gamified?
