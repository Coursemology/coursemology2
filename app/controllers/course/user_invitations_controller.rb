class Course::UserInvitationsController < Course::ComponentController
  before_action :authorize_invitation!
  add_breadcrumb :index, :course_users_students_path

  def new # :nodoc:
  end

  def create # :nodoc:
    if invite
      redirect_to create_redirect_path, success: t('.success')
    else
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
  # @return [Tempfile|Hash|String|nil]
  def invitation_params
    @invitation_params ||= course_user_invitation_params[:invitations_file].try(:tempfile) ||
                           course_user_invitation_params[:invitations_attributes] ||
                           course_user_invitation_params[:registration_key]
  end

  # Determines if the user uploaded a file.
  #
  # @return [bool]
  def invite_by_file?
    invitation_params.is_a?(Tempfile)
  end

  # Determines if the user keyed in entries manually.
  #
  # @return [bool]
  def invite_by_entry?
    invitation_params.is_a?(Hash)
  end

  # Determines if the user is changing the registration code enabled state.
  #
  # @return [bool]
  def invite_by_registration_code?
    invitation_params.nil? || invitation_params.is_a?(String)
  end

  # Invites the users via the service object.
  #
  # @return [bool] True if the invitation was successful.
  def invite
    if invite_by_file? || invite_by_entry?
      invitation_service.invite(invitation_params)
    elsif invite_by_registration_code?
      invitation_service.enable_registration_code(invitation_params == 'checked'.freeze)
    end
  rescue CSV::MalformedCSVError => e
    current_course.errors[:users_file] = e.message
    return false
  end

  # Creates a user invitation service object for this object.
  #
  # @return [Course::UserInvitationService]
  def invitation_service
    @invitation_service ||= Course::UserInvitationService.new(current_user, current_course)
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
