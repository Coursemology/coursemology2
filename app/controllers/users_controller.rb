class UsersController < ApplicationController
  before_action :load_user

  # User emails management
  def emails
    @user.emails.build
  end

  # Update action of emails
  def update_emails
    if @user.update_attributes(email_params)
      redirect_to user_emails_path, success: 'Success'
    else
      redirect_to user_emails_path, danger: @user.errors
    end
  end

  private

  def load_user #:nodoc
    @user = current_user
  end

  def email_params #:nodoc
    params.require(:user).permit(emails_attributes: [:id, :email])
  end
end
