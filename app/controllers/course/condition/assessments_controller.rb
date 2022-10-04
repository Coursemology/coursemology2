# frozen_string_literal: true
class Course::Condition::AssessmentsController < Course::ConditionsController
  load_resource :assessment_condition, class: Course::Condition::Assessment.name, parent: false
  before_action :set_course_and_conditional, only: [:new, :create]
  authorize_resource :assessment_condition, class: Course::Condition::Assessment.name

  def create
    try_to_perform @assessment_condition.save
  end

  def update
    try_to_perform @assessment_condition.update(assessment_condition_params)
  end

  def destroy
    try_to_perform @assessment_condition.destroy
  end

  private

  def try_to_perform(operation_succeeded)
    if operation_succeeded
      success_action
    else
      render json: { errors: @assessment_condition.errors }, status: :bad_request
    end
  end

  def assessment_condition_params
    params.require(:condition_assessment).permit(:assessment_id, :minimum_grade_percentage)
  end

  def set_course_and_conditional
    @assessment_condition.course = current_course
    @assessment_condition.conditional = @conditional
  end

  # Define assessment component for the check whether the component is defined.
  #
  # @return [Course::AssessmentsComponent] The assessments component.
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_assessments_component]
  end
end
