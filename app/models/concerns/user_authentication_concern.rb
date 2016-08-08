# frozen_string_literal: true
module UserAuthenticationConcern
  extend ActiveSupport::Concern
  include Devise::SignInCallbacks

  included do
    # Include default devise modules. Others available are:
    # :validatable, :confirmable, :lockable, :timeoutable and :omniauthable
    devise :multi_email_authenticatable, :multi_email_confirmable, :multi_email_validatable,
           :registerable, :recoverable, :rememberable, :trackable, :masqueradable

    before_sign_in :create_instance_user
    before_validation :find_and_set_invitation_email, if: :new_record?
    after_create :create_instance_user

    include UserOmniauthConcern
    include ReplacementMethods
  end

  # Enables token authentication for this user.
  def enable_token_authentication
    ensure_authentication_token
  end

  # Disables token authentication for this user.
  def disable_token_authentication
    self.authentication_token = nil
  end

  private

  # Check if current_user's email is in the invitation list, link email to the email in the
  # invitation list if any.
  def find_and_set_invitation_email
    invited_email_ids = Course::UserInvitation.select(:user_email_id)
    invited_email = User::Email.find_by(id: invited_email_ids, user: nil, email: email)

    return unless invited_email
    invited_email.primary = true
    self.emails = [invited_email]
  end

  def create_instance_user
    instance_users.create if persisted? && instance_users.empty?
  end

  module ReplacementMethods
    # Overrides `Devise::Models::Validatable`
    # This disables the devise email validation for system user.
    def email_required?
      built_in? ? false : super
    end

    # Overrides `Devise::Models::Validatable`
    # This disables the devise password validation for system user.
    def password_required?
      built_in? ? false : super
    end
  end
end
