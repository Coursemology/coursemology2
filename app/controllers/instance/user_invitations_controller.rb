# frozen_string_literal: true
class Instance::UserInvitationsController < System::Admin::Instance::Controller
  load_and_authorize_resource :instance_user, class: InstanceUser.name,
                                              parent: false,
                                              except: [:new, :create]
  add_breadcrumb :index, :admin_instance_users_path

  def index
    @invitations = @instance.invitations.order(name: :asc)
  end

  def new
    @instance.invitations.build
  end

  def create
    result = invite
    if result
      redirect_to admin_instance_users_path, success: t('.success')
    else
      redirect_to new_admin_instance_user_path, danger: create_form_error_message
    end
  end

  private

  # Invites the users via the service object.
  #
  # @return [Boolean] True if the invitation was successful.
  def invite
    invitation_service.invite(invitation_params)
  end

  def invitation_service
    @invitation_service ||= Instance::UserInvitationService.new(current_instance_user, @instance)
  end

  def invitation_params
    @invitation_params ||= instance_user_invitation_params[:invitations_attributes].to_h
  end

  def instance_user_invitation_params # :nodoc:
    @instance_user_invitation_params ||= params.require(:instance).
                                         permit(invitations_attributes: [:name, :email, :role, :_destroy, :id])
  end

  def create_form_error_message
    invitation_error = @instance.invitations.reject(&:valid?).first&.errors&.full_messages&.to_sentence
    instance_user_error = @instance.instance_users.reject(&:valid?).first&.errors&.full_messages&.to_sentence
    invitation_error || instance_user_error
  end
end
