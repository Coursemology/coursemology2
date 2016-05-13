# frozen_string_literal: true
class Course::Achievement::AchievementsController < Course::Achievement::Controller
  before_action :authorize_achievement!, only: [:update]

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
    @achievement_params ||= params.require(:achievement).
                            permit(:title, :description, :weight, :draft, :badge,
                                   course_user_ids: [])
  end

  # Only allow awarding of manually awarded achievements.
  def authorize_achievement!
    authorize!(:award, @achievement) if achievement_params.include?(:course_user_ids)
  end
end
