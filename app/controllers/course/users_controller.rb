# frozen_string_literal: true
class Course::UsersController < Course::ComponentController
  include Course::UsersBreadcrumbConcern
  include Course::UsersControllerManagementConcern

  before_action :load_resource
  authorize_resource :course_user, through: :course, parent: false

  def index # :nodoc:
  end

  def show
    @skills_service = Course::SkillsMasteryPreloadService.new(current_course,
                                                              @course_user)
  end

  private

  def load_resource
    course_users = current_course.course_users
    case params[:action]
    when 'index'
      @course_users ||= course_users.without_phantom_users.students.
                        includes(:user).order_alphabetically
    else
      return if super
      @course_user ||= course_users.includes(:user).find(params[:id])
    end
  end

  # @return [Course::UsersComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_users_component]
  end
end
