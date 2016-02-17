# frozen_string_literal: true
module Course::AchievementConditionalConcern
  extend ActiveSupport::Concern

  included do
    before_action :add_conditional_breadcrumbs
  end

  def return_to_path
    edit_course_achievement_path(current_course, @conditional)
  end

  def set_conditional
    @conditional = Course::Achievement.find(params[:achievement_id])
  end

  private

  def add_conditional_breadcrumbs
    add_breadcrumb :index, :course_achievements_path
    add_breadcrumb @conditional.title, edit_course_achievement_path(current_course, @conditional)
  end
end
