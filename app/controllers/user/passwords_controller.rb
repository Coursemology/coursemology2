# frozen_string_literal: true
class User::PasswordsController < Devise::PasswordsController
  respond_to :json

  def edit
    super

    if (user = User.find_by(reset_password_token: hash_reset_password_token(params[:reset_password_token])))
      render json: { email: user.email }
    else
      render json: { error: 'Invalid token' }, status: :bad_request
    end
  end

  private

  def hash_reset_password_token(token)
    Devise.token_generator.digest(self, :reset_password_token, token)
  end
end
