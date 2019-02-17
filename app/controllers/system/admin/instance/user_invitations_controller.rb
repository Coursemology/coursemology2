# frozen_string_literal: true
class System::Admin::Instance::UserInvitationsController < System::Admin::Instance::Controller
  load_and_authorize_resource :instance_user, class: InstanceUser.name,
                                              parent: false,
                                              except: [:new, :create, :destroy]
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
      redirect_to admin_instance_user_invitations_path, success: create_success_message(*result),
                                                        warning: create_warning_message(*result)
    else
      propagate_errors
      render 'new'
    end
  end

  def destroy
    @invitation = Instance::UserInvitation.find(params[:id])
    if @invitation.destroy
      redirect_to admin_instance_user_invitations_path,
                  success: t('.success', name: @invitation.name)
    else
      redirect_to admin_instance_user_invitations_path,
                  danger: @invitation.errors.full_messages.to_sentence
    end
  end

  def resend_invitation
    @invitation = invitations.first
    if @invitation && invitation_service.resend_invitation(invitations)
      flash.now[:success] = t('.success', email: @invitation.email)
    else
      flash.now[:danger] = t('.failure')
    end
    render 'reload_instance_user_invitation'
  end

  def resend_invitations
    if invitation_service.resend_invitation(invitations)
      redirect_to admin_instance_user_invitations_path, success: t('.success')
    else
      redirect_to admin_instance_user_invitations_path, danger: t('.failure')
    end
  end

  private

  def instance_user_invitation_params # :nodoc:
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
    @invitation_service ||= Instance::UserInvitationService.new(current_instance_user, @instance)
  end

  def invitations
    @invitations ||= begin
      ids = resend_invitation_params
      ids ||= @instance.invitations.unconfirmed.select(:id)
      if ids.blank?
        []
      else
        @instance.invitations.unconfirmed.where('instance_user_invitations.id IN (?)', ids)
      end
    end
  end

  def propagate_errors
  end

  def create_success_message(new_invitations, existing_invitations, new_instance_users,
                             existing_instance_users,  _duplicate_users)
    t('.success',
      new_invitations: t('.summary.new_invitations', count: new_invitations),
      already_invited: t('.summary.already_invited', count: existing_invitations),
      new_instance_users: t('.summary.new_instance_users', count: new_instance_users),
      already_in_instance: t('.summary.already_in_instance', count: existing_instance_users))
  end

  def create_warning_message(_new_invitations, _existing_invitations, _new_instance_users,
                             _existing_instance_users, duplicate_users)
    t('.summary.duplicate_emails', count: duplicate_users) if duplicate_users > 0
  end
end
