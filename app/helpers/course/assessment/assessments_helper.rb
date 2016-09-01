# frozen_string_literal: true
module Course::Assessment::AssessmentsHelper
  def display_assessment_tabs
    return nil if @category.tabs.count == 1
    tabs do
      @category.tabs.each do |item|
        concat(nav_to(format_inline_text(item.title),
                      course_assessments_path(current_course, category: @category, tab: item)))
      end
    end
  end

  def condition_not_satisfied(assessment)
    cannot?(:attempt, assessment) &&
      assessment.start_at < Time.zone.now &&
      !assessment.conditions_satisfied_by?(current_course_user)
  end
end
