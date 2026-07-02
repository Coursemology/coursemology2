# frozen_string_literal: true
json.weightedViewEnabled @weighted_view_enabled
json.canManageWeights can?(:manage_gradebook_weights, current_course)

json.categories @categories do |cat|
  json.id cat.id
  json.title cat.title
end

json.tabs @tabs do |tab|
  json.id tab.id
  json.title tab.title
  json.categoryId tab.category_id
  if @weighted_view_enabled
    contribution = @tab_contributions[tab.id]
    json.gradebookWeight (contribution&.weight || 0).to_f
    json.weightMode(contribution&.weight_mode || 'equal')
    json.keepHighest(contribution&.keep_highest || 0)
  end
end

json.assessments @published_assessments do |assessment|
  json.id assessment.id
  json.title assessment.title
  json.tabId assessment.tab_id
  json.maxGrade @assessment_max_grades[assessment.id] || 0
  if @weighted_view_enabled
    contribution = @assessment_contributions[assessment.id]
    json.gradebookWeight contribution&.weight&.to_f
    json.gradebookExcluded(contribution&.excluded || false)
  end
end

json.students @students do |course_user|
  json.id course_user.user_id
  json.name course_user.name
  json.email course_user.user.email
  json.externalId course_user.external_id
  json.level course_user.level_number
  json.totalXp course_user.experience_points
  json.levelContribution @student_level_contributions[course_user.user_id]
end

json.submissions @submissions do |sub|
  json.studentId sub.student_id
  json.assessmentId sub.assessment_id
  json.submissionId sub.submission_id
  json.grade sub.grade&.to_f
end

json.gamificationEnabled current_course.gamified?

json.courseMaxLevel @course_max_level

json.levelContribution do
  if @weighted_view_enabled && @level_config
    json.enabled @level_config.enabled
    json.formula @level_config.formula
    json.weight @level_config.weight.to_f
    json.show @level_config.show
    json.clamp @level_config.clamp
  else
    json.enabled false
    json.formula ''
    json.weight 0
    json.show false
    json.clamp true
  end
end
