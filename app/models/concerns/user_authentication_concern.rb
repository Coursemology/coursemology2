module UserAuthenticationConcern
  extend ActiveSupport::Concern
  include Devise::SignInCallbacks

  included do
    # Include default devise modules. Others available are:
    # :validatable, :confirmable, :lockable, :timeoutable and :omniauthable
    devise :database_authenticatable, :registerable,
           :recoverable, :rememberable, :trackable

    before_sign_in :create_instance_user
    after_create :create_instance_user

    validates :email, presence: true, if: :email_required?
    validates :password, presence: true, if: :password_required?
    validates :password, confirmation: true, if: :password_required?
    validates :password, length: { within: Devise.password_length, allow_blank: true }

    extend ReplacementClassMethods
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

  module ReplacementClassMethods
    # Overrides Devise::Models::Authenticatable::ClassMethods#find_first_by_auth_conditions
    # This will check the user's various emails instead of just one email per user.
    #
    # @return [User|nil] The user matching the given conditions.
    def find_first_by_auth_conditions(tainted_conditions, opts = {})
      email = tainted_conditions.delete(:email)
      if email && email.is_a?(String)
        conditions = devise_parameter_filter.filter(tainted_conditions).merge(opts).
                     reverse_merge(emails: { email: email })

        joins(:emails).where { users.id != User::SYSTEM_USER_ID }.find_by(conditions)
      else
        super(tainted_conditions, opts)
      end
    end
  end
end
