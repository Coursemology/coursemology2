# frozen_string_literal: true
class Course::Condition::SurveysController < Course::ConditionsController
  load_resource :survey_condition, class: Course::Condition::Survey.name, parent: false
  before_action :set_course_and_conditional, only: [:new, :create]
  authorize_resource :survey_condition, class: Course::Condition::Survey.name

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
