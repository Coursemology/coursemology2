# frozen_string_literal: true
class Course::Condition::SurveysController < Course::ConditionsController
  load_resource :survey_condition, class: 'Course::Condition::Survey', parent: false
  before_action :set_course_and_conditional, only: [:create]
  authorize_resource :survey_condition, class: 'Course::Condition::Survey'

  def index
    render_available_surveys
  end

  def show
    render_available_surveys
  end

  def create
    try_to_perform @survey_condition.save
  end

  def update
    try_to_perform @survey_condition.update(survey_condition_params)
  end

  def destroy
    try_to_perform @survey_condition.destroy
  end

  private

  def render_available_surveys
    surveys = current_course.surveys
    existing_conditions = @conditional.specific_conditions - [@survey_condition]
    @available_surveys = (surveys - existing_conditions.map(&:dependent_object)).sort_by(&:title)
    render 'available_surveys'
  end

  def try_to_perform(operation_succeeded)
    if operation_succeeded
      success_action
    else
      render json: { errors: @survey_condition.errors }, status: :bad_request
    end
  end

  def survey_condition_params
    params.require(:condition_survey).permit(:survey_id)
  end

  def set_course_and_conditional
    @survey_condition.course = current_course
    @survey_condition.conditional = @conditional
  end

  # Define survey component for the check whether the component is defined.
  #
  # @return [Course::SurveyComponent] The survey component.
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_survey_component]
  end
end
