# frozen_string_literal: true
json.weightedViewEnabled @weighted_view_enabled
json.canManageWeights can?(:manage_gradebook_weights, current_course)
json.capTotal @settings.cap_weighted_total

json.categories do
  json.array!(@categories) do |cat|
    json.id cat.id
    json.title cat.title
  end
  if @external_assessments.any?
    json.child! do
      json.id Course::ExternalAssessment::SYNTHETIC_CATEGORY_ID
      json.title Course::ExternalAssessment::SYNTHETIC_CATEGORY_TITLE
    end
  end
end

json.tabs do
  json.array!(@tabs) do |tab|
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
  @external_assessments.each do |external|
    json.child! do
      json.id external.synthetic_tab_id
      json.title external.title
      json.categoryId Course::ExternalAssessment::SYNTHETIC_CATEGORY_ID
      if @weighted_view_enabled
        contribution = @external_contributions[external.id]
        json.gradebookWeight (contribution&.weight || 0).to_f
        json.weightMode 'equal'
      end
    end
  end
end

json.assessments do
  json.array!(@published_assessments) do |assessment|
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
  @external_assessments.each do |external|
    json.child! do
      json.id(-external.id)
      json.title external.title
      json.tabId external.synthetic_tab_id
      json.maxGrade external.maximum_grade.to_f
      json.external true
      json.floorAtZero external.floor_at_zero
      json.capAtMaximum external.cap_at_maximum
      if @weighted_view_enabled
        contribution = @external_contributions[external.id]
        json.gradebookWeight contribution&.weight&.to_f
        json.gradebookExcluded false
      end
    end
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

json.submissions do
  json.array!(@submissions) do |sub|
    json.submissionId sub.submission_id
    json.studentId sub.student_id
    json.assessmentId sub.assessment_id
    json.grade sub.grade&.to_f
  end
  @external_grades.each do |grade|
    json.child! do
      json.studentId grade.course_user.user_id
      json.assessmentId(-grade.external_assessment_id)
      json.grade grade.grade&.to_f
    end
  end
end

json.gamificationEnabled current_course.gamified?

json.courseMaxLevel @course_max_level

json.levelContribution do
  if @weighted_view_enabled && @level_config
    json.partial! 'course/gradebook/level_contribution', level_config: @level_config
  else
    json.enabled false
    json.formula ''
    json.weight 0
    json.show false
    json.clamp true
  end
end

json.userId current_user&.id
