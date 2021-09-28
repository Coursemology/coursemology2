# frozen_string_literal: true
module Course::Assessment::AssessmentsHelper
  include Course::Achievement::AchievementsHelper
  include Course::Condition::ConditionsHelper

  def display_assessment_tabs
    return nil if @category.tabs.count == 1

    # Set the first tab as active if there's no tab parameter in the URL.
    active_tab = params[:tab] || @category.tabs.first
    tabs do
      @category.tabs.each do |item|
        # If this is the tab previously set as active because there was no tab parameter in the URL,
        # pass a hash to `nav_to` so it will show the tab as active.
        # See https://github.com/doabit/bootstrap-sass-extras/blob/6aa549b91a66055a5f5e37400dbe44f4d17f09c3/app/helpers/nav_helper.rb#L32
        html_options = item == active_tab ? { active: true } : nil
        concat(nav_to(format_inline_text(item.title),
                      course_assessments_path(current_course, category: @category, tab: item),
                      html_options))
      end
    end
  end

  def condition_not_satisfied(assessment)
    cannot?(:attempt, assessment) &&
      assessment.start_at < Time.zone.now &&
      !assessment.conditions_satisfied_by?(current_course_user)
  end

  def show_bonus_attributes?
    @show_bonus_end_at ||= begin
      return false unless current_course.gamified?

      @assessments.any? do |assessment|
        assessment.bonus_end_at.present? && assessment.time_bonus_exp > 0
      end
    end
  end

  def show_end_at?
    @show_end_at ||= begin
      @assessments.any? { |assessment| assessment.end_at.present? }
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
