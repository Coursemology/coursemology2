# frozen_string_literal: true
class User::RegistrationsController < Devise::RegistrationsController
  before_action :configure_sign_up_params, only: [:create]
  before_action :load_invitation, only: [:new, :create]
  layout :select_layout

  # GET /resource/sign_up
  def new
    if @invitation&.confirmed?
      message = @invitation.confirmer ? t('.used_with_email', email: @invitation.confirmer.email) : t('.used')
      redirect_to root_path, danger: message
    else
      super
    end
  end

  # POST /resource
  def create
    User.transaction do
      super
      if @invitation && !@invitation.confirmed? && resource.persisted?
        @invitation.confirm!(confirmer: resource)
      end
    end
  end

  # GET /resource/edit
  # def edit
  #   super
  # end

  # PUT /resource
  # def update
  #   super
  # end

  # DELETE /resource
  # def destroy
  #   super
  # end

  # GET /resource/cancel
  # Forces the session data which is usually expired after sign
  # in to be expired now. This is useful if the user wants to
  # cancel oauth signing in/up in the middle of the process,
  # removing all OAuth session data.
  # def cancel
  #   super
  # end

  protected

  # If you have extra params to permit, append them to the sanitizer.
  def configure_sign_up_params
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
  end

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_account_update_params
  #   devise_parameter_sanitizer.for(:account_update) << :attribute
  # end

  # The path used after sign up.
  # def after_sign_up_path_for(resource)
  #   super(resource)
  # end

  # The path used after sign up for inactive accounts.
  # def after_inactive_sign_up_path_for(resource)
  #   super(resource)
  # end

  # Selects the layout for this controller.
  #
  # This controller uses two layouts, one specially for editing users because it is in the context
  # of the user administration panel.
  #
  # @return [String]
  # @return [nil]
  def select_layout
    'user_admin' if ['edit', 'update'].include?(params['action'])
  end

  # Override Devise::RegistrationsController#build_resource
  # This is for updating the user with invitation.
  def build_resource(*)
    super
    resource.build_from_invitation(@invitation) if @invitation && action_name == 'create'
  end

  def load_invitation
    return if invitation_param.blank?

    if invitation_param.first == Course::UserInvitation::INVITATION_KEY_IDENTIFIER
      @invitation = Course::UserInvitation.find_by(invitation_key: invitation_param)
    elsif invitation_param.first == Instance::UserInvitation::INVITATION_KEY_IDENTIFIER
      @invitation = Instance::UserInvitation.find_by(invitation_key: invitation_param)
    end
  end

  def invitation_param
    params.permit(:invitation)[:invitation]
  end
end
