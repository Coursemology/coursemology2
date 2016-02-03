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
    after_create :create_instance_user

    include UserOmniauthConcern
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

  def create_instance_user
    instance_users.create if persisted? && instance_users.empty?
  end
end
