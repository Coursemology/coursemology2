# frozen_string_literal: true
class Course::Condition::AchievementsController < Course::ConditionsController
  include Course::Achievement::AchievementsHelper
  include ActionView::Helpers::AssetUrlHelper
  load_resource :achievement_condition, class: 'Course::Condition::Achievement', parent: false
  before_action :set_course, only: [:create]
  authorize_resource :achievement_condition, class: 'Course::Condition::Achievement'

  def index
    render_available_achievements
  end

  def show
    render_available_achievements
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

  def render_available_achievements
    achievements = current_course.achievements
    existing_conditions = @conditional.specific_conditions - [@achievement_condition]
    available_achievements = achievements - existing_conditions.map(&:dependent_object)
    available_achievements_hash = available_achievements.to_h do |achievement|
      [
        achievement.id,
        title: achievement.title,
        description: achievement.description,
        badge: achievement_badge_path(achievement)
      ]
    end

    render json: available_achievements_hash
  end

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
