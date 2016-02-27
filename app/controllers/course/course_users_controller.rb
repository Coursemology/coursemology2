# frozen_string_literal: true
class Course::CourseUsersController < Course::ComponentController
  load_and_authorize_resource :course_user, through: :course
  helper Course::AchievementsHelper.name.sub(/Helper$/, '')

  def show # :nodoc:
  end
end
