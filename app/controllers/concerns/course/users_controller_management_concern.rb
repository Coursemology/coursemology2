# frozen_string_literal: true
module Course::UsersControllerManagementConcern
  extend ActiveSupport::Concern

  included do
    before_action :authorize_show!, only: [:students, :staff, :requests, :invitations]
    before_action :authorize_edit!, only: [:update, :destroy, :upgrade_to_staff]
  end

  def update # :nodoc:
    if update_course_user(course_user_params)
      flash.now[:success] = update_success_flash
    else
      flash.now[:danger] = @course_user.errors.full_messages.to_sentence
    end
  end

  def destroy # :nodoc:
    if @course_user.destroy
      success = t('course.users.destroy.success', role: @course_user.role,
                                                  email: @course_user.user.email)
      redirect_to delete_redirect_path, success: success
    else
      redirect_to delete_redirect_path, danger: @course_user.errors.full_messages.to_sentence
    end
  end

  def students # :nodoc:
    @course_users = @course_users.students.with_approved_state.includes(user: :emails).
                    order_alphabetically
  end

  def staff # :nodoc:
    @student_options =
      @course_users.students.with_approved_state.order_alphabetically.pluck(:name, :id)
    @course_users = @course_users.staff.with_approved_state.includes(user: :emails).
                    order_alphabetically
  end

  def upgrade_to_staff # :nodoc:
    if @course_user.update(upgrade_to_staff_params)
      upgrade_to_staff_success
    else
      upgrade_to_staff_failure
    end
  end

  def requests # :nodoc:
    @course_users = @course_users.with_requested_state.includes(user: :emails)
  end

  def invitations # :nodoc:
    @course_users = @course_users.joins { invitation }.includes(invitation: :user_email).
                    order(workflow_state: :desc, name: :asc)
  end

  private

  def course_user_params # :nodoc:
    @course_user_params ||= params.require(:course_user).
                            permit(:user_id, :name, :workflow_state, :role, :phantom)
  end

  def upgrade_to_staff_params # :nodoc:
    @upgrade_to_staff_params ||= params.require(:course_user).permit(:id, :role)
  end

  def load_resource
    course_users = current_course.course_users
    case params[:action]
    when 'invitations'
      @course_users ||= course_users
    when 'students', 'staff', 'requests'
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

  # Updates the course user. This will dispatch an email to the user if he transitions to the
  # +approved+ state.
  #
  # @param [Hash] course_user_params The parameters to set on the given Course User.
  # @return [Boolean] True if the course user was updated successfully.
  def update_course_user(course_user_params)
    course_user_requested = @course_user.requested?
    result = @course_user.update(course_user_params)
    if course_user_requested && @course_user.approved?
      Course::Mailer.user_added_email(current_course, @course_user).deliver_later
    end

    result
  end

  # Returns the appropriate success flash message depending on the origin of the request.
  def update_success_flash
    if update_request_origin == :requests
      t('course.users.update.request_success', name: @course_user.name,
                                               workflow_state: @course_user.workflow_state,
                                               role: t("course.users.role.#{@course_user.role}"))
    else
      t('course.users.update.success', name: @course_user.name)
    end
  end

  # Deduces which page the update request originated from.
  def update_request_origin
    @update_request_origin ||=
      if course_user_params.key?(:workflow_state)
        :requests
      elsif course_user_params.key?(:role)
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
    success = t('course.users.upgrade_to_staff.success',
                name: @course_user.name, role: t("course.users.role.#{@course_user.role}"))
    redirect_to course_users_staff_path(current_course), success: success
  end

  def upgrade_to_staff_failure # :nodoc:
    redirect_to course_users_staff_path(current_course),
                danger: @course_user.errors.full_messages.to_sentence
  end
end
