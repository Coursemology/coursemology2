# frozen_string_literal: true
class Course::Condition::LevelsController < Course::ConditionsController
  load_resource :level_condition, class: 'Course::Condition::Level', parent: false
  before_action :set_course, only: [:new, :create]
  authorize_resource :level_condition, class: 'Course::Condition::Level'

  def create
    @level_condition.conditional = @conditional
    try_to_perform @level_condition.save
  end

  def update
    try_to_perform @level_condition.update(level_condition_params)
  end

  def destroy
    try_to_perform @level_condition.destroy
  end

  private

  def try_to_perform(operation_succeeded)
    if operation_succeeded
      success_action
    else
      render json: { errors: @level_condition.errors }, status: :bad_request
    end
  end

  def level_condition_params
    params.require(:condition_level).permit(:minimum_level)
  end

  def set_course
    @level_condition.course = current_course
  end

  # Define levels component for the check whether the component is defined.
  #
  # @return [Course::LevelsComponent] The levels component.
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_levels_component]
  end
end
