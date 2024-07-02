# frozen_string_literal: true
class Course::Condition::AssessmentsController < Course::ConditionsController
  load_resource :assessment_condition, class: 'Course::Condition::Assessment', parent: false
  before_action :set_course_and_conditional, only: [:create]
  authorize_resource :assessment_condition, class: 'Course::Condition::Assessment'

  def index
    render_available_assessments
  end

  def show
    render_available_assessments
  end

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

  def render_available_assessments
    assessments = current_course.assessments.ordered_by_date_and_title
    existing_conditions = @conditional.specific_conditions - [@assessment_condition]
    @available_assessments = (assessments - existing_conditions.map(&:dependent_object)).sort_by(&:title)
    render 'available_assessments'
  end

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
