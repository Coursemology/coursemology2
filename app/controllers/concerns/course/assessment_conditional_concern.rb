# frozen_string_literal: true
module Course::AssessmentConditionalConcern
  extend ActiveSupport::Concern

  def success_action
    render partial: 'course/condition/conditions', locals: { conditional: @conditional }
  end

  def set_conditional
    @conditional = Course::Assessment.find(conditional_params[:assessment_id])
  end

  private

  def conditional_params
    params.permit(:assessment_id)
  end
end
