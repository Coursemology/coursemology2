# frozen_string_literal: true
class User::EmailsController < ApplicationController
  load_and_authorize_resource :email, through: :current_user, class: 'User::Email'

  def index
  end

  def create
    if @email.save
      render_emails
    else
      render json: { errors: @email.errors }, status: :bad_request
    end
  end

  def destroy
    if @email.destroy
      render_emails
    else
      render json: { errors: @email.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  # Set an email as the primary email
  def set_primary
    current_user.email = @email.email
    if current_user.save
      render_emails
    else
      render json: { errors: @email.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def send_confirmation
    if @email.confirmed?
      render json: { errors: t('.already_confirmed', email: @email.email) }, status: :bad_request
    else
      @email.send_confirmation_instructions
      head :ok
    end
  end

  private

  def render_emails
    @emails = current_user.reload.emails
    render 'index'
  end

  def email_params
    params.require(:user_email).permit(:email)
  end
end
