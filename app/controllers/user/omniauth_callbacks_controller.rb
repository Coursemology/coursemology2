# frozen_string_literal: true
class User::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def facebook
    if user_signed_in?
      link_user_with_facebook
    else
      sign_in_with_facebook
    end
  end

  private

  def link_user_with_facebook
    auth = request.env['omniauth.auth']
    if current_user&.persisted? && current_user&.link_with_omniauth!(auth)
      redirect_to edit_user_profile_path, success: t('user.omniauth_callbacks.facebook.success')
    else
      redirect_to edit_user_profile_path, danger: t('user.omniauth_callbacks.facebook.failed')
    end
  end

  def sign_in_with_facebook
    @user = User.find_or_create_by_omniauth(request.env['omniauth.auth'])
    if @user.persisted?
      facebook_sign_in_success_redirect(@user)
    else
      facebook_sign_in_fail_redirect(@user)
    end
  end

  def facebook_sign_in_success_redirect(user)
    sign_in_and_redirect(user, event: :authentication)
    if is_navigational_format?
      set_flash_message(:notice, :success,
                        kind: t('user.omniauth_callbacks.facebook.kind'))
    end
  end

  def facebook_sign_in_fail_redirect(user)
    session['devise.facebook_data'] = request.env['omniauth.auth']
    redirect_to new_user_registration_path,
                danger: t('user.omniauth_callbacks.facebook.sign_in_failure',
                          error: user.errors.full_messages.to_sentence)
  end
end
