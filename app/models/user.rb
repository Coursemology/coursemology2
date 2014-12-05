# Represents a user in the application. Users are shared across all instances.
class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :validatable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable

  has_many :emails, class_name: UserEmail.name
  has_many :instance_users
  has_many :instances, through: :instance_users

  validates_presence_of :email, if: :email_required?
  validates_presence_of  :password, if: :password_required?
  validates_confirmation_of :password, if: :password_required?
  validates_length_of :password, within: Devise::password_length, allow_blank: true

  accepts_nested_attributes_for :emails

  # Gets the email address of the user.
  #
  # @return [String, nil] The email address of the user.
  def email
    result_record = default_email_record
    if result_record
      default_email_record.email
    else
      nil
    end
  end

  # Sets the default email address of the user.
  #
  # @param email [String, nil] The email address of the user to set. Nil unsets the record.
  def email=(email)
    record = default_email_record
    if email
      record ||= emails.build
      record.email = email
      record.primary = true
    elsif email.nil? && record
      record.mark_for_destruction
    end
  end

  private

  # Gets the default email address record.
  #
  # @return [UserEmail] The user's primary email address record.
  def default_email_record
    valid_emails = emails.each.select { |email_record| !email_record.marked_for_destruction? }
    result = valid_emails.find { |email_record| email_record.primary? }
    result ||= valid_emails.first
    result ||= emails.order('primary=1 ASC').first
    result
  end

  # Checks whether a password is needed or not. For validations only.
  # Passwords are always required if it's a new record, or if the password or confirmation are
  # being set somewhere.
  def password_required?
    !persisted? || !password.nil? || !password_confirmation.nil?
  end

  def email_required?
    true
  end
end
