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

    if @achievement_condition.save
      redirect_to return_to_path, success: t('course.condition.achievements.create.success')
    else
      render :new
    end
  end

  def edit
  end

  def update
    if @achievement_condition.update(achievement_condition_params)
      redirect_to return_to_path, success: t('course.condition.achievements.update.success')
    else
      render :edit
    end
  end

  def destroy
    if @achievement_condition.destroy
      redirect_to return_to_path, success: t('course.condition.achievements.destroy.success')
    else
      redirect_to return_to_path, danger: t('course.condition.achievements.destroy.error')
    end
  end

  private

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
