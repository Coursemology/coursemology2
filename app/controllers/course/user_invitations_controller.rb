# frozen_string_literal: true
class Course::UserInvitationsController < Course::ComponentController
  before_action :authorize_invitation!
  add_breadcrumb :index, :course_users_students_path

  def new # :nodoc:
  end

  def create # :nodoc:
    if invite
      redirect_to create_redirect_path, success: t('.success')
    else
      propagate_errors
      render 'new'
    end
  end

  private

  # Prevents access to this set of pages unless the user is a staff of the course.
  def authorize_invitation!
    authorize!(:manage_users, current_course)
  end

  def course_user_invitation_params # :nodoc:
    invitations_attributes = { course_user: [:name], user_email: [:email] }
    @invite_params ||= params.require(:course).
                       permit(:invitations_file, :registration_key,
                              invitations_attributes: invitations_attributes)
  end

  # Determines the parameters to be passed to the invitation service object.
  #
  # @return [Tempfile]
  # @return [Hash]
  # @return [Boolean]
  def invitation_params
    @invitation_params ||= course_user_invitation_params[:invitations_file].try(:tempfile) ||
                           course_user_invitation_params[:invitations_attributes] ||
                           course_user_invitation_params[:registration_key] == 'checked'.freeze
  end

  # Determines if the user uploaded a file.
  #
  # @return [Boolean]
  def invite_by_file?
    invitation_params.is_a?(Tempfile)
  end

  # Determines if the user keyed in entries manually.
  #
  # @return [Boolean]
  def invite_by_entry?
    invitation_params.is_a?(Hash)
  end

  # Determines if the user is changing the registration code enabled state.
  #
  # @return [Boolean]
  def invite_by_registration_code?
    invitation_params.is_a?(TrueClass) || invitation_params.is_a?(FalseClass)
  end

  # Invites the users via the service object.
  #
  # @return [Boolean] True if the invitation was successful.
  def invite
    if invite_by_file? || invite_by_entry?
      invitation_service.invite(invitation_params)
    elsif invite_by_registration_code?
      invitation_service.enable_registration_code(invitation_params)
    end
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
    invalid_course_user_errors + invalid_user_email_errors
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

  # Aggregates errors caused by a user who already exists.
  #
  # @return [Array<String>]
  def invalid_user_email_errors
    invalid_user_emails.map do |user_email|
      message = user_email.errors.full_messages.to_sentence
      t('course.user_invitations.errors.invalid_email', email: user_email.email, message: message)
    end
  end

  # Finds all the invalid email objects in the current course.
  #
  # @return [Array<User::Email>]
  def invalid_user_emails
    current_course.course_users.
      map { |course_user| course_user.invitation.try(:user_email) }.
      reject { |user_email| user_email.nil? || user_email.errors.empty? }
  end

  # The path to redirect to after the {#create} action.
  #
  # @return [String]
  def create_redirect_path
    if invite_by_file? || invite_by_entry?
      course_users_invitations_path(current_course)
    elsif invite_by_registration_code?
      invite_course_users_path(current_course, anchor: 'registration_code')
    end
  end
end
