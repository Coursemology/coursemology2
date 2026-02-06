# frozen_string_literal: true
class System::Admin::Instance::UserInvitationsController < System::Admin::Instance::Controller
  load_and_authorize_resource :instance_user, class: 'InstanceUser',
                                              parent: false,
                                              except: [:new, :create, :destroy]

  def index
    @invitations = @instance.invitations.order(name: :asc)
    respond_to do |format|
      format.json
    end
  end

  def new
    render 'system/admin/instance/admin/index'
  end

  def create
    result = invite
    if result
      render json: {
        newInvitations: result[0].length,
        invitationResult: parse_invitation_result(*result)
      }, status: :ok
    else
      head :bad_request
    end
  end

  def destroy
    @invitation = Instance::UserInvitation.find(params[:id])
    if @invitation.destroy
      head :ok
    else
      render json: { errors: @invitation.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def resend_invitation
    @invitation = invitations.first
    if @invitation && invitation_service.resend_invitation(invitations)
      render partial: 'instance_user_invitation_list_data', locals: { invitation: @invitation.reload },
             status: :ok
    else
      head :bad_request
    end
  end

  def resend_invitations
    if invitation_service.resend_invitation(invitations)
      render 'index', locals: { invitations: @invitations.reload },
                      status: :ok
    else
      head :bad_request
    end
  end

  private

  def instance_user_invitation_params
    @instance_user_invitation_params ||= begin
      params[:instance] = { invitations_attributes: {} } unless params.key?(:instance)
      params.require(:instance).permit(invitations_attributes: [:name, :email, :role, :_destroy, :id])
    end
  end

  def invitation_params
    @invitation_params ||= instance_user_invitation_params[:invitations_attributes].to_h
  end

  def resend_invitation_params
    @resend_invitation_params ||= params.permit(:user_invitation_id)[:user_invitation_id] if
                                  params[:user_invitation_id].present?
  end

  # Invites the users via the service object.
  #
  # @return [Boolean] True if the invitation was successful.
  def invite
    invitation_service.invite(invitation_params)
  end

  def invitation_service
    @invitation_service ||= Instance::UserInvitationService.new(@instance)
  end

  def invitations
    @invitations ||= begin
      ids = resend_invitation_params
      ids ||= @instance.invitations.retryable.unconfirmed.select(:id)
      if ids.blank?
        []
      else
        @instance.invitations.retryable.unconfirmed.where('instance_user_invitations.id IN (?)', ids)
      end
    end
  end

  # Returns the invitation response based on entry invitation.
  def parse_invitation_result(new_invitations, existing_invitations, new_instance_users,
                              existing_instance_users, duplicate_users)
    render_to_string(partial: 'invitation_result_data', locals: { new_invitations: new_invitations,
                                                                  existing_invitations: existing_invitations,
                                                                  new_instance_users: new_instance_users,
                                                                  existing_instance_users: existing_instance_users,
                                                                  duplicate_users: duplicate_users })
  end
end
