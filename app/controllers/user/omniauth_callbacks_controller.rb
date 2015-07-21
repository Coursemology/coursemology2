class User::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def facebook
    if user_signed_in?
      link_current_account_to_facebook
    else
      sign_in_with_facebook
    end
  end

  private

  def link_current_account_to_facebook
    # TODO: Implement
  end

  def sign_in_with_facebook
    auth = request.env['omniauth.auth']
    @user = User.find_or_create_by_omniauth(auth)
    if @user.persisted?
      sign_in_and_redirect(@user, event: :authentication)
      set_flash_message(:notice, :success,
                        kind: t('user.omniauth_callbacks.facebook.kind')) if is_navigational_format?
    else
      session['devise.facebook_data'] = auth
      redirect_to new_user_registration_path
    end
  end
end
