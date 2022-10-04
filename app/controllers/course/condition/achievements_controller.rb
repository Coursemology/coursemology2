# frozen_string_literal: true
class Course::Condition::AchievementsController < Course::ConditionsController
  load_resource :achievement_condition, class: Course::Condition::Achievement.name, parent: false
  before_action :set_course, only: [:new, :create]
  authorize_resource :achievement_condition, class: Course::Condition::Achievement.name

  def new
    @achievement_condition.course = current_course
    authorize!(:new, @achievement_condition)
  end

  def create
    @achievement_condition.conditional = @conditional
    @achievement_condition.course = current_course
    authorize!(:create, @achievement_condition)

    try_to_perform @achievement_condition.save
  end

  def update
    try_to_perform @achievement_condition.update(achievement_condition_params)
  end

  def destroy
    try_to_perform @achievement_condition.destroy
  end

  private

  def try_to_perform(operation_succeeded)
    if operation_succeeded
      success_action
    else
      render json: { errors: @achievement_condition.errors }, status: :bad_request
    end
  end

  def achievement_condition_params
    params.require(:condition_achievement).permit(:achievement_id)
  end

  def set_course
    @achievement_condition.course = current_course
  end

  # Define achievement component for the check whether the component is defined.
  #
  # @return [Course::AchievementsComponent] The achievements component.
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_achievements_component]
  end
end
