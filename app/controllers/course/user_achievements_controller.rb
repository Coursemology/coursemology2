# frozen_string_literal: true
class Course::UserAchievementsController < Course::ComponentController
  load_and_authorize_resource :achievement, through: :course, parent: false,
                              class: Course::Achievement.name
  add_breadcrumb :index, :course_users_students_path
  helper Course::AchievementsHelper

  def index # :nodoc:
  end

  def edit # :nodoc:
  end

  def update # :nodoc:
  end

  private

  def achievement_params #:nodoc:
    params.require(:achievement).permit(course_user_attributes: [:id])
  end
end
