# frozen_string_literal: true
module Course::AchievementConditionalConcern
  extend ActiveSupport::Concern

  def success_action
    render partial: 'course/condition/conditions', locals: { conditional: @conditional }
  end

  def set_conditional
    @conditional = Course::Achievement.find(params[:achievement_id])
  end
end
