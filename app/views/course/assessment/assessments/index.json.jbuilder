# frozen_string_literal: true
achievements_enabled = !current_component_host[:course_achievements_component].nil?
submissions_hash = @assessments.to_h { |assessment| [assessment.id, assessment.submissions] }

json.display do
  json.isStudent current_course_user&.student? || false
  json.isGamified current_course.gamified?
  json.timelineAlgorithm current_course_user&.timeline_algorithm
  json.allowRandomization current_course.allow_randomization
  json.isAchievementsEnabled achievements_enabled
  json.isMonitoringEnabled @monitoring_component_enabled
  json.bonusAttributes show_bonus_attributes?
  json.endTimes show_end_at?
  json.canCreateAssessments can?(:create, Course::Assessment.new(tab: @tab))
  json.canManageMonitor @can_manage_monitor && @monitoring_component_enabled

  json.category do
    json.id @category.id
    json.title @category.title
    json.tabs @category.tabs.each do |tab|
      json.id tab.id
      json.title tab.title
    end
  end

  json.tabId @tab.id
  json.tabTitle "#{@category.title}: #{@tab.title}"
  json.tabUrl course_assessments_path(course_id: current_course, category: @category, tab: @tab)
end

json.assessments @assessments do |assessment|
  json.id assessment.id
  json.title assessment.title

  json.passwordProtected assessment.view_password_protected?
  json.published assessment.published?
  json.autograded assessment.autograded?
  json.hasPersonalTimes current_course.show_personalized_timeline_features && assessment.has_personal_times?
  json.hasTodo assessment.has_todo if can?(:manage, assessment)
  json.affectsPersonalTimes current_course.show_personalized_timeline_features && assessment.affects_personal_times?
  json.url course_assessment_path(current_course, assessment)
  json.timeLimit assessment.time_limit

  assessment_with_loaded_timeline = @items_hash[assessment.id].actable
  # assessment_with_loaded_timeline is passed below since the timeline is already preloaded and will be checked
  can_attempt_assessment = can?(:attempt, assessment_with_loaded_timeline)

  submissions = submissions_hash[assessment.id]
  json.partial! 'assessment_actions', assessment: assessment_with_loaded_timeline, submissions: submissions

  if achievements_enabled
    achievement_conditionals = @conditional_service.achievement_conditional_for(assessment)

    top_conditionals = achievement_conditionals.first(3)
    json.topConditionals do
      json.partial! 'achievement_badges', achievements: top_conditionals, course: current_course
    end

    conditionals_count = achievement_conditionals.size
    if conditionals_count > top_conditionals.size
      json.remainingConditionalsCount conditionals_count - top_conditionals.size
    end
  end

  json.baseExp assessment.base_exp if current_course.gamified? && assessment.base_exp > 0

  assessment_time = @items_hash[assessment.id].time_for(current_course_user)
  json.conditionSatisfied !condition_not_satisfied(
    can_attempt_assessment,
    assessment_with_loaded_timeline,
    assessment_time
  )

  json.isStartTimeBegin !assessment_not_started(assessment_time)
  json.startAt do
    json.partial! 'course/lesson_plan/items/personal_or_ref_time', locals: {
      item: @items_hash[assessment.id],
      course_user: current_course_user,
      attribute: :start_at,
      datetime_format: :short
    }
  end

  has_bonus_attributes = assessment_time.bonus_end_at.present? && assessment.time_bonus_exp > 0
  if show_bonus_attributes? && has_bonus_attributes
    json.timeBonusExp assessment.time_bonus_exp if assessment.time_bonus_exp > 0
    json.isBonusEnded assessment_time.bonus_end_at < Time.zone.now
    json.bonusEndAt do
      json.partial! 'course/lesson_plan/items/personal_or_ref_time', locals: {
        item: @items_hash[assessment.id],
        course_user: current_course_user,
        attribute: :bonus_end_at,
        datetime_format: :short
      }
    end
  end

  has_end_time = assessment_time.end_at.present?
  if show_end_at? && has_end_time
    json.isEndTimePassed assessment_time.end_at < Time.zone.now
    json.endAt do
      json.partial! 'course/lesson_plan/items/personal_or_ref_time', locals: {
        item: @items_hash[assessment.id],
        course_user: current_course_user,
        attribute: :end_at,
        datetime_format: :short
      }
    end
  end
end
