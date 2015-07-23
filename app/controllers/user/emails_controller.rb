class User::EmailsController < ApplicationController
  load_and_authorize_resource :email, through: :current_user, class: User::Email.name
  layout 'user_admin'

  def index #:nodoc:
    @new_email = current_user.emails.build
  end

  def create #:nodoc:
    if @email.save
      redirect_to user_emails_path, success: t('.success')
    else
      redirect_to user_emails_path, danger: @email.errors.full_messages.to_sentence
    end
  end

  def destroy #:nodoc
    if @email.destroy
      redirect_to user_emails_path, success: t('.success')
    else
      redirect_to user_emails_path, error: @email.errors.full_messages.to_sentence
    end
  end

  # Set an email as the primary email
  def set_primary
    if @email.primary!
      redirect_to user_emails_path, success: t('.success')
    else
      redirect_to user_emails_path, error: @email.errors.full_messages.to_sentence
    end
  end

  private

  def email_params
    params.require(:user_email).permit(:email)
  end
end
