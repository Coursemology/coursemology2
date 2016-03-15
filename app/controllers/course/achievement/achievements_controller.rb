# frozen_string_literal: true
class Course::Achievement::AchievementsController < Course::Achievement::Controller
  def index #:nodoc:
    @achievements = @achievements.includes(:conditions)
  end

  def show #:nodoc:
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    if @achievement.save
      redirect_to course_achievements_path(current_course),
                  success: t('.success', title: @achievement.title)
    else
      render 'new'
    end
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @achievement.update_attributes(achievement_params)
      redirect_to course_achievements_path(current_course),
                  success: t('.success', title: @achievement.title)
    else
      render 'edit'
    end
  end

  def destroy #:nodoc:
    if @achievement.destroy
      redirect_to course_achievements_path(current_course),
                  success: t('.success', title: @achievement.title)
    else
      redirect_to course_achievements_path,
                  danger: t('.failure', error: @achievement.errors.full_messages.to_sentence)
    end
  end

  private

  def achievement_params #:nodoc:
    params.require(:achievement).permit(:title, :description, :weight, :draft, :badge)
  end
end
