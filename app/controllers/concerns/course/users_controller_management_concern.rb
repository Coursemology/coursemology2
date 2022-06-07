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
    @student_options = @course_users.students.order_alphabetically.pluck(:name, :id)
    @course_users = @course_users.includes(user: :emails).order_alphabetically
  end

  def upgrade_to_staff # :nodoc:
    if @course_user.update(upgrade_to_staff_params)
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
    @upgrade_to_staff_params ||= params.require(:course_user).permit(:id, :role)
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
      format.html do
        success = t('course.users.upgrade_to_staff.success',
                    name: @course_user.name, role: t("course.users.role.#{@course_user.role}"))
        redirect_to course_users_staff_path(current_course), success: success
      end
      format.json { render json: { user: @course_user }, status: :ok }
    end
  end

  def upgrade_to_staff_failure # :nodoc:
    respond_to do |format|
      format.html { redirect_to course_users_staff_path(current_course),danger: @course_user.errors.full_messages.to_sentence }
      format.json { render json: { errors: @course_user.errors.full_messages.to_sentence }, status: :bad_request }
    end
  end

  def update_user_success # :nodoc:
    respond_to do |format|
      format.html { flash.now[:success] = t('course.users.update.success', name: @course_user.name) }
      format.json { render json: { user: @course_user }, status: :ok }
    end
  end

  def update_user_failure # :nodoc:
    respond_to do |format|
      format.html { flash.now[:success] = t('course.users.update.success', name: @course_user.name) }
      format.json { render json: { errors: @course_user.errors.full_messages.to_sentence }, status: :bad_request }
    end
  end

  def destroy_user_success # :nodoc:
    respond_to do |format|
      format.html do
        success = t('course.users.destroy.success', role: @course_user.role, email: @course_user.user.email)
        redirect_to delete_redirect_path, success: success
      end
      format.json { head :ok }
    end
  end

  def destroy_user_failure # :nodoc:
    respond_to do |format|
      format.html { redirect_to delete_redirect_path, danger: @course_user.errors.full_messages.to_sentence }
      format.json { render json: { errors: @course_user.errors.full_messages.to_sentence }, status: :bad_request }
    end
  end
end
