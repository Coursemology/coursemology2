# frozen_string_literal: true
class Course::Condition::ScholaisticAssessmentsController < Course::ConditionsController
  load_resource :scholaistic_assessment_condition, class: Course::Condition::ScholaisticAssessment.name, parent: false
  before_action :set_course_and_conditional, only: [:create]
  authorize_resource :scholaistic_assessment_condition, class: Course::Condition::ScholaisticAssessment.name

  def index
    render_available_scholaistic_assessments
  end

  def show
    render_available_scholaistic_assessments
  end

  def create
    try_to_perform @scholaistic_assessment_condition.save
  end

  def update
    try_to_perform @scholaistic_assessment_condition.update(scholaistic_assessment_condition_params)
  end

  def destroy
    try_to_perform @scholaistic_assessment_condition.destroy
  end

  private

  def render_available_scholaistic_assessments
    scholaistic_assessments = current_course.scholaistic_assessments
    existing_conditions = @conditional.specific_conditions - [@scholaistic_assessment_condition]
    @available_assessments = (scholaistic_assessments - existing_conditions.map(&:dependent_object)).sort_by(&:title)
    render 'available_scholaistic_assessments'
  end

  def try_to_perform(operation_succeeded)
    if operation_succeeded
      success_action
    else
      render json: { errors: @scholaistic_assessment_condition.errors }, status: :bad_request
    end
  end

  def scholaistic_assessment_condition_params
    params.require(:condition_scholaistic_assessment).permit(:scholaistic_assessment_id)
  end

  def set_course_and_conditional
    @scholaistic_assessment_condition.course = current_course
    @scholaistic_assessment_condition.conditional = @conditional
  end

  def component
    current_component_host[:course_scholaistic_component]
  end
end
