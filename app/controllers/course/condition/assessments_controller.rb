# frozen_string_literal: true
class Course::Condition::AssessmentsController < Course::ConditionsController
  load_resource :assessment_condition, class: Course::Condition::Assessment.name, parent: false
  before_action :set_course_and_conditional, only: [:new, :create]
  authorize_resource :assessment_condition, class: Course::Condition::Assessment.name

  def new
  end

  def create
    if @assessment_condition.save
      redirect_to return_to_path, success: t('course.condition.assessments.create.success')
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @assessment_condition.update(assessment_condition_params)
      redirect_to return_to_path, success: t('course.condition.assessments.update.success')
    else
      render 'edit'
    end
  end

  def destroy
    if @assessment_condition.destroy
      redirect_to return_to_path, success: t('course.condition.assessments.destroy.success')
    else
      redirect_to return_to_path, danger: t('course.condition.assessments.destroy.error')
    end
  end

  private

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
