# frozen_string_literal: true
module UserAuthenticationConcern
  extend ActiveSupport::Concern

  included do
    # Include default devise modules. Others available are:
    # :validatable, :confirmable, :lockable, :timeoutable and :omniauthable
    # Devise is now only used to manage user registration.
    # Authentication workflow is handled by external authenticator (ie keycloak)
    devise :multi_email_authenticatable, :multi_email_confirmable, :multi_email_validatable,
           :registerable, :recoverable, :rememberable, :trackable

    after_create :create_instance_user
    after_create :delete_unused_instance_invitation

    include ReplacementMethods
  end

  private

  def create_instance_user
    return unless persisted? && instance_users.empty?

    role = @instance_invitation&.role
    instance_users.create(role: role)
  end

  def delete_unused_instance_invitation
    invitation = Instance::UserInvitation.find_by(email: email)
    invitation.destroy if invitation && @instance_invitation.nil?
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
