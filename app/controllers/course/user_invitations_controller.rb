# frozen_string_literal: true
class Course::UserInvitationsController < Course::ComponentController
  before_action :authorize_invitation!
  load_resource :invitation, through: :course, class: Course::UserInvitation, parent: false,
                             only: :destroy
  add_breadcrumb :index, :course_users_students_path

  def index
    @invitations = current_course.invitations.order(name: :asc)
  end

  def new
    current_course.invitations.build
  end

  def create
    result = invite
    if result
      create_invitation_success(result)
    else
      propagate_errors
      render json: { errors: current_course.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy
    if @invitation.destroy
      destroy_invitation_success t('.success', name: @invitation.name)
    else
      destroy_invitation_failure
    end
  end

  def resend_invitation
    @invitation = load_invitations.first
    @serial_number = params[:serial_number]
    if @invitation && invitation_service.resend_invitation(load_invitations)
      resend_invitation_success t('.success', email: @invitation.email)
    else
      resend_invitation_failure t('.failure')
    end
  end

  def resend_invitations
    if invitation_service.resend_invitation(load_invitations)
      resend_invitations_success t('.success')
    else
      resend_invitations_failure t('.failure')
    end
  end

  def toggle_registration
    render 'new' if enable_registration_code(registration_params)
  end

  private

  def course_user_invitation_params # :nodoc:
    @course_user_invitation_params ||= begin
      params[:course] = { invitations_attributes: {} } unless params.key?(:course)
      params.require(:course).permit(:invitations_file, :registration_key,
                                     invitations_attributes: [:name, :email, :role, :phantom, :timeline_algorithm])
    end
  end

  # Determines the parameters to be passed to the invitation service object.
  #
  # @return [Tempfile]
  # @return [Hash]
  def invitation_params
    @invitation_params ||= course_user_invitation_params[:invitations_file]&.tempfile ||
                           course_user_invitation_params[:invitations_attributes].to_h
  end

  # Returns the param on whether to enable or disable registration via registration code.
  #
  # @return [Boolean]
  def registration_params
    @registration_params ||= course_user_invitation_params[:registration_key] == 'checked'
  end

  # Strong params for resending of invitations.
  #
  # @return [String|nil] Returns invitation.id. If none were found, nil is returned.
  def resend_invitation_params
    @resend_invitation_params ||=
      (params.permit(:user_invitation_id)[:user_invitation_id] unless params[:user_invitation_id].blank?)
  end

  # Loads existing invitations for the resending of invitations. Method handles the following cases:
  #   1) Single invitation - specified with the user_invitation_id param
  #   2) All un-confirmed invitation - if user_invitation_id param was not found
  def load_invitations
    @invitations ||= begin
      ids = resend_invitation_params
      ids ||= current_course.invitations.unconfirmed.select(:id)
      if ids.blank?
        []
      else
        current_course.invitations.unconfirmed.where('course_user_invitations.id IN (?)', ids)
      end
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
    false
  end

  # Creates a user invitation service object for this object.
  #
  # @return [Course::UserInvitationService]
  def invitation_service
    @invitation_service ||= Course::UserInvitationService.new(current_course_user)
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
      user = self.class.helpers.display_course_user(course_user)
      t('course.user_invitations.errors.duplicate_user', user: user)
    end
  end

  # Finds all the invalid Course User objects in the current course.
  #
  # @return [Array<CourseUser>]
  def invalid_course_users
    current_course.course_users.reject(&:valid?)
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
    current_course.invitations.reject(&:valid?)
  end

  # Returns the invitation response based on file or entry invitation.
  def parse_invitation_result(new_invitations, existing_invitations, new_course_users,
                              existing_course_users, duplicate_users)
    render_to_string(partial: 'invitation_result_data', locals: { new_invitations: new_invitations,
                                                                  existing_invitations: existing_invitations,
                                                                  new_course_users: new_course_users,
                                                                  existing_course_users: existing_course_users,
                                                                  duplicate_users: duplicate_users })
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

  # @return [Course::UsersComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_users_component]
  end

  def resend_invitation_success(message) # :nodoc:
    respond_to do |format|
      format.html { flash.now[:success] = message }
      format.json { render json: { id: @invitation.id }, status: :ok }
    end
  end

  def resend_invitation_failure(message) # :nodoc:
    respond_to do |format|
      format.html { flash.now[:danger] = message }
      format.json { head :bad_request }
    end
  end

  def resend_invitations_success(message) # :nodoc:
    respond_to do |format|
      format.html { redirect_to course_user_invitations_path(current_course), success: message }
      format.json { head :ok }
    end
  end

  def resend_invitations_failure(message) # :nodoc:
    respond_to do |format|
      format.html { redirect_to course_user_invitations_path(current_course), danger: message }
      format.json { head :bad_request }
    end
  end

  def destroy_invitation_success(message)
    respond_to do |format|
      format.html do
        redirect_to course_user_invitations_path(current_course), success: message
      end
      format.json { render json: { id: @invitation.id }, status: :ok }
    end
  end

  def destroy_invitation_failure
    respond_to do |format|
      format.html do
        redirect_to course_user_invitations_path(current_course), danger: @invitation.errors.full_messages.to_sentence
      end
      format.json { render json: { errors: @invitation.errors.full_messages.to_sentence }, status: :bad_request }
    end
  end

  def create_invitation_success(result)
    respond_to do |format|
      format.json do
        @invitations = current_course.invitations.order(name: :asc)
        @invitation_result = parse_invitation_result(*result)
        render 'index'
      end
    end
  end
end
