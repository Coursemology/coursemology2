class Course::UserInvitationsController < Course::ComponentController
  before_action :authorize_invitation!
  add_breadcrumb :index, :course_users_students_path

  def new # :nodoc:
  end

  def create # :nodoc:
    if invite
      redirect_to course_users_invitations_path(current_course), success: t('.success')
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
                       permit(:invitations_file, invitations_attributes: invitations_attributes)
  end

  # Determines the parameters to be passed to the invitation service object.
  #
  # @return [Hash]
  def invitation_params
    course_user_invitation_params[:invitations_file].try(:tempfile) ||
      course_user_invitation_params[:invitations_attributes]
  end

  # Invites the users via the service object.
  #
  # @return [bool] True if the invitation was successful.
  def invite
    invitation_service.invite(invitation_params)
  rescue CSV::MalformedCSVError => e
    current_course.errors[:users_file] = e.message
    return false
  end

  # Creates a user invitation service object for this object.
  #
  # @return [Course::UserInvitationService]
  def invitation_service
    @invitation_service ||= Course::UserInvitationService.new(current_course)
  end
end
