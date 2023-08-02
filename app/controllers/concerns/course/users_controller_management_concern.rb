# frozen_string_literal: true
module Course::UsersControllerManagementConcern
  include Course::LessonPlan::PersonalizationConcern

  extend ActiveSupport::Concern

  included do
    before_action :authorize_show!, only: [:students, :staff, :requests, :invitations]
    before_action :authorize_edit!, only: [:update, :destroy, :upgrade_to_staff, :assign_timeline]
  end

  def update
    @course_user.assign_attributes(course_user_params)

    update_personalized_timeline_for_user(@course_user) if should_update_personalized_timeline

    if @course_user.save
      update_user_success
    else
      update_user_failure
    end
  end

  def destroy
    if @course_user.destroy
      destroy_user_success
    else
      destroy_user_failure
    end
  end

  def students
    respond_to do |format|
      format.json do
        @course_users = @course_users.students.includes(:groups, user: :emails).order_alphabetically
      end
    end
  end

  def staff
    respond_to do |format|
      format.json do
        @student_options = @course_users.students.order_alphabetically.pluck(:id, :name, :role)
        @course_users = @course_users.staff.includes(user: :emails).order_alphabetically
      end
    end
  end

  def upgrade_to_staff
    upgrade_to_staff_params
    if upgrade_students_to_staff
      upgrade_to_staff_success
    else
      upgrade_to_staff_failure
    end
  end

  def assign_timeline
    course_user_ids = assign_timeline_params[:ids]
    timeline_id = assign_timeline_params[:reference_timeline_id]

    timeline = Course::ReferenceTimeline.find(timeline_id)

    ActiveRecord::Base.transaction do
      updated_course_users = []
      @course_users.where(id: course_user_ids).find_each do |course_user|
        course_user.reference_timeline = timeline
        updated_course_users << course_user
      end

      raise unless updated_course_users.size == course_user_ids.size

      CourseUser.import! updated_course_users, on_duplicate_key_update: [:reference_timeline_id]

      head :ok
    end
  rescue StandardError
    head :bad_request
  end

  private

  def should_update_personalized_timeline
    @course_user.timeline_algorithm_changed? || @course_user.reference_timeline_id_changed?
  end

  def course_user_params
    @course_user_params ||= params.require(:course_user).permit(
      :user_id, :name, :timeline_algorithm, :role, :phantom, :reference_timeline_id
    )
  end

  def upgrade_to_staff_params
    @upgrade_to_staff_params ||= params.require(:course_users).permit(:role, ids: [])
    params.require(:user).permit(:id)
  end

  def assign_timeline_params
    params.require(:course_users).permit(:reference_timeline_id, ids: [])
  end

  def load_resource
    course_users = current_course.course_users
    case params[:action]
    when 'invitations', 'assign_timeline'
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

  def upgrade_to_staff_success
    respond_to do |format|
      format.json do
        render partial: 'upgrade_to_staff_results', locals: {
          upgraded_course_users: @upgraded_course_users
        }, status: :ok
      end
    end
  end

  def upgrade_to_staff_failure
    respond_to do |format|
      format.json { render json: { errors: @course_user.errors.full_messages.to_sentence }, status: :bad_request }
    end
  end

  def update_user_success
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

  def update_user_failure
    respond_to do |format|
      format.json { render json: { errors: @course_user.errors.full_messages.to_sentence }, status: :bad_request }
    end
  end

  def destroy_user_success
    respond_to do |format|
      format.json { head :ok }
    end
  end

  def destroy_user_failure
    respond_to do |format|
      format.json { render json: { errors: @course_user.errors.full_messages.to_sentence }, status: :bad_request }
    end
  end
end
