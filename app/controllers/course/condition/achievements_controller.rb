class Course::Condition::AchievementsController < Course::ConditionsController
  load_and_authorize_resource :achievement_condition,
                              class: Course::Condition::Achievement.name, parent: false

  def new
  end

  def create
    @achievement_condition.conditional = @conditional
    @achievement_condition.course = @course

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
      redirect_to return_to_path, alert: t('course.condition.achievements.destroy.error')
    end
  end

  private

  def achievement_condition_params
    params.require(:course_condition_achievement).permit(:achievement_id)
  end
end
