class User::EmailsController < ApplicationController
  load_and_authorize_resource :email, class: User::Email.name

  # Set an email as the primary email
  def set_primary
    existing_primary_email = current_user.emails.find(&:primary?)
    existing_primary_email.update_columns(primary: false) if existing_primary_email
    if @email.update_columns(primary: true)
      redirect_to user_emails_path, success: 'Success'
    else
      redirect_to user_emails_path, danger: @email.errors
    end
  end

  def destroy #:nodoc
    if @email.destroy
      redirect_to user_emails_path, success: 'Email destroyed'
    else
      redirect_to user_emails_path, error: @email.errors.message
    end
  end
end
