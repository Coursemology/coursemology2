# frozen_string_literal: true
class Course::UsersController < Course::ComponentController
  include Course::UsersControllerManagementConcern

  before_action :load_resource
  authorize_resource :course_user, through: :course, parent: false
  add_breadcrumb :index, :course_users_path
  helper Course::Achievement::ControllerHelper.name.sub(/Helper$/, '')

  def index # :nodoc:
  end

  def show # :nodoc:
  end

  private

  def load_resource
    course_users = current_course.course_users
    case params[:action]
    when 'index'
      @course_users ||= course_users.with_approved_state.students.includes(:user)
    else
      return if super
      @course_user ||= course_users.includes(:user).find(params[:id])
    end
  end
end
