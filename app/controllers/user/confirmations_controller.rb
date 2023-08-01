# frozen_string_literal: true
class User::ConfirmationsController < Devise::ConfirmationsController
  respond_to :json

  def show
    super do |email|
      if email.persisted? && email.confirmed?
        render json: { email: email.email }
      else
        render json: { error: 'Invalid token' }, status: :bad_request
      end

      return
    end
  end
end
