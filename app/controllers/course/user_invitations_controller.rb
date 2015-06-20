class Course::UserInvitationsController < Course::ComponentController
  before_action :authorize_invitation!
  add_breadcrumb :index, :course_users_path

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
    @invite_params ||= params.require(:course).permit(:users_file, users: [:name, :email])
  end

  # Invites the users via the service object.
  #
  # @return [bool] True if the invitation was successful.
  def invite
    invitation_service.invite(course_user_invitation_params[:users_file].try(:tempfile) ||
                                course_user_invitation_params[:users])
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
