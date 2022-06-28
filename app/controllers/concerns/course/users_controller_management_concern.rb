# frozen_string_literal: true
module Course::UsersControllerManagementConcern
  include Course::LessonPlan::PersonalizationConcern

  extend ActiveSupport::Concern

  included do
    before_action :authorize_show!, only: [:students, :staff, :requests, :invitations]
    before_action :authorize_edit!, only: [:update, :destroy, :upgrade_to_staff]
  end

  def update # :nodoc:
    @course_user.assign_attributes(course_user_params)
    # Recompute personal timeline if algorithm changed
    update_personalized_timeline_for_user(@course_user) if @course_user.timeline_algorithm_changed?

    if @course_user.save
      update_user_success
    else
      update_user_failure
    end
  end

  def destroy # :nodoc:
    if @course_user.destroy
      destroy_user_success
    else
      destroy_user_failure
    end
  end

  def students # :nodoc:
    @course_users = @course_users.students.includes(user: :emails).order_alphabetically
  end

  def staff # :nodoc:
    @student_options = @course_users.students.order_alphabetically.pluck(:id, :name)
    @course_users = @course_users.staff.includes(user: :emails).order_alphabetically
  end

  def upgrade_to_staff # :nodoc:
    upgrade_to_staff_params
    if upgrade_students_to_staff
      upgrade_to_staff_success
    else
      upgrade_to_staff_failure
    end
  end

  private

  def course_user_params # :nodoc:
    @course_user_params ||= params.require(:course_user).permit(:user_id, :name, :timeline_algorithm, :role, :phantom)
  end

  def upgrade_to_staff_params # :nodoc:
    @upgrade_to_staff_params ||= params.require(:course_users).permit(:role, ids: [])
    params.require(:user).permit(:id)
  end

  def load_resource
    course_users = current_course.course_users
    case params[:action]
    when 'invitations'
      @course_users ||= course_users
    when 'students', 'staff'
      @course_users ||= course_users.includes(:user)
    when 'upgrade_to_staff'
      @course_user ||= course_users.includes(:user).find(upgrade_to_staff_params[:id])
    end
  end

  def upgrade_students_to_staff
    role = @upgrade_to_staff_params[:role]
    course_users = current_course.course_users
    @upgraded_course_users = []
    @upgrade_to_staff_params[:ids].each do |id|
      course_user = course_users.find(id)
      course_user.update(role: role)
      @upgraded_course_users << course_user.reload
    end

    true
  end

  # Prevents access to this set of pages unless the user is a staff of the course.
  def authorize_show!
    authorize!(:show_users, current_course)
  end

  # Prevents access to this set of pages unless the user is a staff of the course.
  def authorize_edit!
    authorize!(:manage_users, current_course)
  end

  # Deduces which page the update request originated from.
  def update_request_origin
    @update_request_origin ||=
      if course_user_params.key?(:role)
        :staff
      else
        :students
      end
  end

  # Selects an appropriate redirect path depending on the user being deleted.
  def delete_redirect_path
    if @course_user.staff?
      course_users_staff_path(current_course)
    else
      course_users_students_path(current_course)
    end
  end

  def upgrade_to_staff_success # :nodoc:
    respond_to do |format|
      format.json do
        render partial: 'upgrade_to_staff_results', locals: {
          upgraded_course_users: @upgraded_course_users
        }, status: :ok
      end
    end
  end

  def upgrade_to_staff_failure # :nodoc:
    respond_to do |format|
      format.json { render json: { errors: @course_user.errors.full_messages.to_sentence }, status: :bad_request }
    end
  end

  def update_user_success # :nodoc:
    respond_to do |format|
      format.json do
        render '_user_list_data', locals: {
          course_user: @course_user,
          should_show_timeline: true,
          should_show_phantom: true
        }, status: :ok
      end
    end
  end

  def update_user_failure # :nodoc:
    respond_to do |format|
      format.json { render json: { errors: @course_user.errors.full_messages.to_sentence }, status: :bad_request }
    end
  end

  def destroy_user_success # :nodoc:
    respond_to do |format|
      format.json { head :ok }
    end
  end

  def destroy_user_failure # :nodoc:
    respond_to do |format|
      format.json { render json: { errors: @course_user.errors.full_messages.to_sentence }, status: :bad_request }
    end
  end
end
