class User::EmailsController < ApplicationController
  load_and_authorize_resource :email, through: :current_user, class: User::Email.name

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

  private

  def email_params
    params.require(:user_email).permit(:email)
  end
end
