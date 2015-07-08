class Course::Condition::LevelsController < Course::ConditionsController
  load_and_authorize_resource :level_condition, class: Course::Condition::Level.name, parent: false

  def new
  end

  def create
    @level_condition.conditional = @conditional
    @level_condition.course = current_course

    if @level_condition.save
      redirect_to return_to_path, success: t('course.condition.levels.create.success')
    else
      render :new
    end
  end

  def edit
  end

  def update
    if @level_condition.update(level_condition_params)
      redirect_to return_to_path, success: t('course.condition.levels.update.success')
    else
      render :edit
    end
  end

  def destroy
    if @level_condition.destroy
      redirect_to return_to_path, success: t('course.condition.levels.destroy.success')
    else
      redirect_to return_to_path, alert: t('course.condition.levels.destroy.error')
    end
  end

  private

  def level_condition_params
    params.require(:condition_level).permit(:minimum_level)
  end
end
