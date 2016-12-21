# frozen_string_literal: true
class Course::UserInvitationsController < Course::ComponentController
  before_action :authorize_invitation!
  load_resource :invitation, through: :course, class: Course::UserInvitation, parent: false,
                             only: :destroy
  add_breadcrumb :index, :course_users_students_path

  def index
    @invitations = current_course.invitations.order(name: :asc)
  end

  def new; end

  def create # :nodoc:
    if invite
      redirect_to course_user_invitations_path(current_course), success: create_success_message
    else
      propagate_errors
      render 'new'
    end
  end

  def destroy
    if @invitation.destroy
      redirect_to course_user_invitations_path(current_course),
                  success: t('.success', name: @invitation.name)
    else
      redirect_to course_user_invitations_path(current_course),
                  danger: @invitation.errors.full_messages.to_sentence
    end
  end

  def resend_invitations
    if invitation_service.resend_invitation(load_course_users)
      redirect_to course_user_invitations_path(current_course), success: t('.success')
    else
      redirect_to course_user_invitations_path(current_course), danger: t('.failure')
    end
  end

  def toggle_registration
    if enable_registration_code(registration_params)
      redirect_to invite_course_users_path(current_course, anchor: 'registration_code'),
                  success: t('.success')
    else
      redirect_to invite_course_users_path(current_course, anchor: 'registration_code'),
                  danger: t('.failure')
    end
  end

  private

  def course_user_invitation_params # :nodoc:
    @course_user_invitation_params ||= begin
      params[:course] = { invitations_attributes: {} } unless params.key?(:course)

      params.require(:course).permit(:invitations_file, :registration_key,
                                     invitations_attributes: [:name, :email])
    end
  end

  # Determines the parameters to be passed to the invitation service object.
  #
  # @return [Tempfile]
  # @return [Hash]
  def invitation_params
    @invitation_params ||= course_user_invitation_params[:invitations_file].try(:tempfile) ||
                           course_user_invitation_params[:invitations_attributes]
  end

  # Returns the param on whether to enable or disable registration via registration code.
  #
  # @return [Boolean]
  def registration_params
    @registration_params ||= course_user_invitation_params[:registration_key] == 'checked'.freeze
  end

  # Determines the params for load_course_users.
  def resend_invitation_params
    @resend_invitation_params ||=
      if params[:course].blank?
        params
      else
        params.require(:course).permit(:course_user, course_users: [])
      end
  end

  # Filters the course_user ids from resend_invitation_params
  #
  # @return [Array<String>|nil] Array of course_user ids. If none was found in the params,
  #   nil is returned.
  def course_users_from_params
    if resend_invitation_params[:course_user]
      [resend_invitation_params[:course_user]]
    elsif resend_invitation_params[:course_users]
      resend_invitation_params[:course_users]
    end
  end

  # Loads course_users for the resending of invitations. Method handles the following cases:
  #   1) Single course_user - specified with the course_user param
  #   2) Multiple course_users - specified with the course_users param
  #   3) All invited course_users - given none of the above params
  def load_course_users
    @course_users ||= begin
      ids = course_users_from_params
      ids ||= current_course.course_users.with_invited_state.pluck(:id)
      ids.blank? ? [] : CourseUser.includes(:invitation).where { id >> ids }
    end
  end

  # Prevents access to this set of pages unless the user is a staff of the course.
  def authorize_invitation!
    authorize!(:manage_users, current_course)
  end

  # Determines if the user uploaded a file.
  #
  # @return [Boolean]
  def invite_by_file?
    invitation_params.is_a?(Tempfile)
  end

  # Invites the users via the service object.
  #
  # @return [Boolean] True if the invitation was successful.
  def invite
    invitation_service.invite(invitation_params)
  rescue CSV::MalformedCSVError => e
    current_course.errors.add(:invitations_file, e.message)
    return false
  end

  # Creates a user invitation service object for this object.
  #
  # @return [Course::UserInvitationService]
  def invitation_service
    @invitation_service ||= Course::UserInvitationService.new(current_user, current_course)
  end

  # Propagate errors from the parameters depending on the type of the parameters.
  #
  # @return [void]
  def propagate_errors
    propagate_errors_to_file if invite_by_file?
  end

  # Propagates errors from the generated records to the file.
  #
  # @return [void]
  def propagate_errors_to_file
    errors = aggregate_errors
    current_course.errors.add(:invitations_file, errors.to_sentence) unless errors.empty?
  end

  # Aggregates errors from all the known sources of failure.
  #
  # @return [Array<String>] An array of failure messages;
  def aggregate_errors
    invalid_course_user_errors + invalid_invitation_email_errors
  end

  # Aggregates Course User objects which have errors.
  #
  # @return [Array<String>]
  def invalid_course_user_errors
    invalid_course_users.map do |course_user|
      user = self.class.helpers.display_user(course_user.user || course_user)
      t('course.user_invitations.errors.duplicate_user', user: user)
    end
  end

  # Finds all the invalid Course User objects in the current course.
  #
  # @return [Array<CourseUser>]
  def invalid_course_users
    current_course.course_users.
      reject { |course_user| course_user.errors.empty? }
  end

  # Aggregates errors in invitations.
  #
  # @return [Array<String>]
  def invalid_invitation_email_errors
    invalid_invitations.map do |invitation|
      message = invitation.errors.full_messages.to_sentence
      t('course.user_invitations.errors.invalid_email', email: invitation.email, message: message)
    end
  end

  # Finds all the invalid invitation objects in the current course.
  #
  # @return [Array<Course::UserInvitation>]
  def invalid_invitations
    current_course.invitations.reject { |invitation| invitation.errors[:email].empty? }
  end

  # Returns the successful invitation creation message based on file or entry invitation.
  def create_success_message
    if invite_by_file?
      t('course.user_invitations.create.file.success')
    else
      t('course.user_invitations.create.manual_entry.success')
    end
  end

  # Enables or disables registration codes in the given course.
  #
  # @param [Boolean] enable True if registration codes should be enabled.
  # @return [Boolean]
  def enable_registration_code(enable)
    if enable
      return true if current_course.registration_key
      current_course.generate_registration_key
    else
      current_course.registration_key = nil
    end
    current_course.save
  end
end
