# frozen_string_literal: true
module Course::AssessmentConditionalConcern
  extend ActiveSupport::Concern

  included do
    before_action :add_conditional_breadcrumbs
  end

  def success_action
    render partial: 'course/condition/conditions.json', locals: { conditional: @conditional }
  end

  def set_conditional
    @conditional = Course::Assessment.find(conditional_params[:assessment_id])
  end

  private

  def conditional_params
    params.permit(:assessment_id)
  end

  def add_conditional_breadcrumbs
    add_breadcrumb :index, :course_assessments_path
    add_breadcrumb @conditional.title, edit_course_assessment_path(current_course, @conditional)
  end
end
