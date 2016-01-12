module UserAuthenticationConcern
  extend ActiveSupport::Concern
  include Devise::SignInCallbacks

  included do
    # Include default devise modules. Others available are:
    # :validatable, :confirmable, :lockable, :timeoutable and :omniauthable
    devise :multi_email_authenticatable, :registerable,
           :recoverable, :rememberable, :trackable, :masqueradable

    before_sign_in :create_instance_user
    after_create :create_instance_user

    validates :email, presence: true, if: :email_required?
    validates :password, presence: true, if: :password_required?
    validates :password, confirmation: true, if: :password_required?
    validates :password, length: { within: Devise.password_length, allow_blank: true }

    include UserOmniauthConcern
  end

  private

  # Checks whether a password is needed or not. For validations only.
  # Passwords are always required if it's a new record, or if the password or confirmation are
  # being set somewhere.
  def password_required?
    !persisted? || !password.nil? || !password_confirmation.nil?
  end

  def email_required?
    true
  end

  def create_instance_user
    instance_users.create if persisted? && instance_users.empty?
  end
end
