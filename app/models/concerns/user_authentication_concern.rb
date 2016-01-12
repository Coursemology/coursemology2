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

  private

  def create_instance_user
    instance_users.create if persisted? && instance_users.empty?
  end
end
