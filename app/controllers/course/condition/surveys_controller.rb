# frozen_string_literal: true
class Course::Condition::SurveysController < Course::ConditionsController
  load_resource :survey_condition, class: Course::Condition::Survey.name, parent: false
  before_action :set_course_and_conditional, only: [:new, :create]
  authorize_resource :survey_condition, class: Course::Condition::Survey.name

  def new
  end

  def create
    if @survey_condition.save
      redirect_to return_to_path, success: t('course.condition.surveys.create.success')
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @survey_condition.update(survey_condition_params)
      redirect_to return_to_path, success: t('course.condition.surveys.update.success')
    else
      render 'edit'
    end
  end

  def destroy
    if @survey_condition.destroy
      redirect_to return_to_path, success: t('course.condition.surveys.destroy.success')
    else
      redirect_to return_to_path, danger: t('course.condition.surveys.destroy.error')
    end
  end

  private

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
