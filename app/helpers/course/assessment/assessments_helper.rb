# frozen_string_literal: true
module Course::Assessment::AssessmentsHelper
  include Course::Achievement::AchievementsHelper
  include Course::Condition::ConditionsHelper

  def condition_not_satisfied(can_attempt_assessment, assessment, assessment_time)
    (!can_attempt_assessment &&
      !assessment.conditions_satisfied_by?(current_course_user)) ||
      assessment_not_started(assessment_time)
  end

  def assessment_not_started(assessment_time)
    assessment_time.start_at > Time.zone.now
  end

  def show_bonus_attributes?
    @show_bonus_end_at ||= begin
      return false unless current_course.gamified?

      @assessments.any? do |assessment|
        @items_hash[assessment.id].time_for(current_course_user).bonus_end_at.present? && assessment.time_bonus_exp > 0
      end
    end
  end

  def show_end_at?
    @show_end_at ||= @assessments.any? do |assessment|
      @items_hash[assessment.id].time_for(current_course_user).end_at.present?
    end
  end

  def display_graded_test_types(assessment)
    graded_test_case_types = []
    graded_test_case_types.push(t('course.assessment.assessments.show.public_test')) if assessment.use_public
    graded_test_case_types.push(t('course.assessment.assessments.show.private_test')) if assessment.use_private
    graded_test_case_types.push(t('course.assessment.assessments.show.evaluation_test')) if assessment.use_evaluation
    graded_test_case_types.join(', ')
  end
end
