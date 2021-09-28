# frozen_string_literal: true
class User::EmailsController < ApplicationController
  load_and_authorize_resource :email, through: :current_user, class: User::Email.name
  layout 'user_admin'

  def index # :nodoc:
    @new_email = current_user.emails.build
  end

  def create # :nodoc:
    if @email.save
      redirect_to user_emails_path, success: t('.success')
    else
      redirect_to user_emails_path, danger: @email.errors.full_messages.to_sentence
    end
  end

  def destroy # :nodoc:
    if @email.destroy
      redirect_to user_emails_path, success: t('.success')
    else
      redirect_to user_emails_path, error: @email.errors.full_messages.to_sentence
    end
  end

  # Set an email as the primary email
  def set_primary
    current_user.email = @email.email
    if current_user.save
      redirect_to user_emails_path, success: t('.success')
    else
      redirect_to user_emails_path, error: @email.errors.full_messages.to_sentence
    end
  end

  def send_confirmation
    if @email.confirmed?
      redirect_to user_emails_path, warning: t('.already_confirmed', email: @email.email)
    else
      @email.send_confirmation_instructions
      redirect_to user_emails_path, success: t('.success', email: @email.email)
    end
  end

  private

  def email_params
    params.require(:user_email).permit(:email)
  end
end
