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

json.assessments @published_assessments do |asn|
  json.id asn.id
  json.title asn.title
  json.tabId asn.tab_id
  json.maxGrade @assessment_max_grades[asn.id] || 0
end

json.students @students do |course_user|
  json.id course_user.id
  json.name course_user.name
  json.email course_user.user.email
  json.externalId nil
  json.level course_user.level_number
end

json.submissions @submissions do |sub|
  json.studentId sub.creator_id
  json.assessmentId sub.assessment_id
  json.grade sub.grade || 0
  json.workflowState sub.workflow_state
end
