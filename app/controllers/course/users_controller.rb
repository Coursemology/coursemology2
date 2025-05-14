# frozen_string_literal: true
class Course::UsersController < Course::ComponentController
  include Course::UsersControllerManagementConcern

  before_action :load_resource
  authorize_resource :course_user, through: :course, parent: false

  def index
  end

  def destroy
    if @course_user.deleted_at.nil? && @course_user.update_attribute(:deleted_at, Time.now)
      Course::UserDeletionJob.perform_later(current_course, @course_user, current_user)
      head :ok
    else
      head :bad_request
    end
  end

  def show
    @skills_service = Course::SkillsMasteryPreloadService.new(current_course,
                                                              @course_user)
    respond_to do |format|
      format.json { render 'show' }
    end
  end

  private

  def load_resource
    course_users = current_course.course_users
    case params[:action]
    when 'index'
      if params[:as_basic_data] == 'true'
        @user_options = course_users.order_alphabetically.pluck(:id, :name, :role)
      else
        @course_users ||= course_users.without_phantom_users.students.
                          includes(:groups, user: [:emails]).order_alphabetically
      end

    else
      return if super

      @course_user ||= course_users.includes(:user).find(params[:id])
      @learning_rate_record = @course_user.latest_learning_rate_record
    end
  end

  # @return [Course::UsersComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_users_component]
  end
end
