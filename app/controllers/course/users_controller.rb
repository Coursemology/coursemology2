class Course::UsersController < Course::ComponentController
  load_and_authorize_resource :course_user, through: :course, parent: false, new: [:register]
  before_action :set_course_user_user, only: [:register]
  before_action :authorize_show!, only: [:students, :staff, :requests]
  before_action :authorize_edit!, except: [:students, :staff, :requests, :create, :register]
  before_action :ensure_unregistered_user, only: [:create, :register]

  def students # :nodoc:
    @course_users = @course_users.students.with_approved_state
  end

  def staff # :nodoc:
    @course_users = @course_users.staff
  end

  def requests # :nodoc:
    @course_users = @course_users.with_requested_state
  end

  def create # :nodoc:
    @course_user.workflow_state = :approved if can?(:manage_users, current_course)
    authorize_edit! if @course_user.user != current_user
    if @course_user.save
      success = t('.success', role: t("course.users.role.#{@course_user.role}"))
      redirect_to create_redirect_path, success: success
    else
      danger = t('.failure', error: @course_user.errors.full_messages.to_sentence)
      redirect_to create_redirect_path, danger: danger
    end
  end

  def update # :nodoc:
    if @course_user.update(course_user_params)
      success = t('.success', role: t("course.users.role.#{@course_user.role}"))
      redirect_to update_redirect_path, success: success
    else
      redirect_to update_redirect_path, danger: @course_user.errors.full_messages.to_sentence
    end
  end

  def destroy # :nodoc:
    if @course_user.destroy
      success = t('.success', role: @course_user.role, email: @course_user.user.email)
      redirect_to delete_redirect_path, success: success
    else
      redirect_to delete_redirect_path, danger: @course_user.errors.full_messages.to_sentence
    end
  end

  def register # :nodoc:
    create
  end

  private

  def course_user_params # :nodoc:
    @course_user_params ||= params.require(:course_user).
                            permit(:user_id, :name, :workflow_state, :role, :phantom)
  end

  def set_course_user_user
    @course_user.user = current_user
  end

  # Prevents access to this set of pages unless the user is a staff of the course.
  def authorize_show!
    authorize!(:show_users, current_course)
  end

  # Prevents access to this set of pages unless the user is a staff of the course.
  def authorize_edit!
    authorize!(:manage_users, current_course)
  end

  # Selects an appropriate redirect path depending on the current user. Users can be redirected
  # to this path if they are trying to create a CourseUser record and they need to be redirected
  # out.
  def create_redirect_path
    if can?(:manage_users, current_course)
      course_users_students_path(current_course)
    else
      course_path(current_course)
    end
  end

  # Selects an appropriate redirect path depending on the contents of the post data.
  def update_redirect_path
    if course_user_params.key?(:workflow_state)
      course_users_requests_path(current_course)
    else
      course_users_students_path(current_course)
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

  def ensure_unregistered_user
    return unless current_course.course_users.exists?(user: @course_user.user)

    role = t("course.users.role.#{current_course_user.role}")
    message = t('course.users.new.already_registered', role: role)
    redirect_to create_redirect_path, info: message
  end
end
