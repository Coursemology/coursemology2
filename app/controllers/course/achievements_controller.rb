class Course::AchievementsController < Course::ModuleController
  load_and_authorize_resource :achievement, through: :course, class: Course::Achievement.name

  def index #:nodoc:
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    if @achievement.save
      redirect_to(course_achievements_path(@course),
                  notice: t('.notice', title: @achievement.title))
    else
      render 'new'
    end
  end

  private

  def achievement_params #:nodic:
    params.require(:course_achievement).permit(:title, :description, :weight, :published)
  end
end
