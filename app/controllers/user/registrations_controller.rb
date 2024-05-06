# frozen_string_literal: true
class User::RegistrationsController < Devise::RegistrationsController
  before_action :configure_sign_up_params, only: [:create]
  before_action :load_invitation, only: [:new, :create]
  respond_to :json

  # GET /resource/sign_up
  def new
    if @invitation&.confirmed?
      message = @invitation.confirmer ? t('.used_with_email', email: @invitation.confirmer.email) : t('.used')
      render json: { message: message }, status: :conflict and return
    elsif @invitation
      course = @invitation.course

      render json: {
        name: @invitation.name,
        email: @invitation.email,
        courseTitle: course.title,
        courseId: course.id
      }
    else
      head :no_content
    end
  end

  # POST /resource
  def create
    unless verify_recaptcha
      build_resource(sign_up_params)
      render json: { errors: { recaptcha: t('user.registrations.create.verify_recaptcha_alert') } },
             status: :unprocessable_entity
      return
    end

    User.transaction do
      super

      @invitation.confirm!(confirmer: resource) if @invitation && !@invitation.confirmed? && resource.persisted?
      @user = resource
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

  # Override Devise::RegistrationsController#build_resource
  # This is for updating the user with invitation.
  def build_resource(*)
    super
    resource.build_from_invitation(@invitation) if @invitation && action_name == 'create'
  end

  def load_invitation
    return if invitation_param.blank?

    case invitation_param.first
    when Course::UserInvitation::INVITATION_KEY_IDENTIFIER
      @invitation = Course::UserInvitation.find_by(invitation_key: invitation_param)
    when Instance::UserInvitation::INVITATION_KEY_IDENTIFIER
      @invitation = Instance::UserInvitation.find_by(invitation_key: invitation_param)
    end
  end

  def invitation_param
    params.permit(:invitation)[:invitation]
  end

  def authenticate_scope!
    raise AuthenticationError unless current_user

    self.resource = send(:"current_#{resource_name}")
  end
end
