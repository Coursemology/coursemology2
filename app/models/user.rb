# Represents a user in the application. Users are shared across all instances.
class User < ActiveRecord::Base
  include UserAuthenticationConcern
  model_stamper
  acts_as_reader

  enum role: { normal: 0, administrator: 1 }

  after_validation :propagate_user_email_errors

  has_many :emails, -> { order('primary' => :desc) }, class_name: User::Email.name,
                                                      inverse_of: :user, dependent: :destroy
  has_many :instance_users, dependent: :destroy
  has_many :instances, through: :instance_users
  has_many :identities, dependent: :destroy, class_name: User::Identity.name
  has_many :activities, inverse_of: :actor, dependent: :destroy, foreign_key: 'actor_id'.freeze
  has_many :notifications, dependent: :destroy, class_name: UserNotification.name
  has_many :course_users, dependent: :destroy
  has_many :courses, through: :course_users
  has_many :course_group_users, dependent: :destroy, class_name: Course::GroupUser.name
  has_many :course_groups, through: :course_group_users, class_name: Course::Group.name

  accepts_nested_attributes_for :emails

  scope :ordered_by_name, -> { order(:name) }

  # Gets the email address of the user.
  #
  # @return [String, nil] The email address of the user.
  def email
    result_record = default_email_record
    default_email_record.email if result_record
  end

  # Sets the default email address of the user.
  #
  # @param [String, nil] email The email address of the user to set. Nil unsets the record.
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

  def email_changed?
    !persisted? || (emails.loaded? && emails.each.any?(&:changed))
  end

  # Unset current primary email. This method would immediately set the attributes in the database.
  #
  # @return [Boolean] True if current primary emails was set as non primary or there is no
  #   primary email, false if failed.
  def unset_primary_email
    return true unless default_email_record

    default_email_record.update_attributes(primary: false)
  end

  # Pick the default email and set it as primary email. This method would immediately set the
  # attributes in the database.
  #
  # @return [Boolean] True if the new email was set as primary, false if failed or next email
  #   cannot be found.
  def set_next_email_as_primary
    return false unless default_email_record

    default_email_record.update_attributes(primary: true)
  end

  private

  # Propagates the error from the +user_emails+ association to the main object
  #
  # @return [void]
  def propagate_user_email_errors
    return if errors[:'emails.email'].nil?

    errors[:'emails.email'].each do |error|
      errors.add(:email, error)
    end
  end

  # Gets the default email address record.
  #
  # @return [User::Email] The user's primary email address record.
  def default_email_record
    valid_emails = emails.each.select do |email_record|
      !email_record.destroyed? && !email_record.marked_for_destruction?
    end
    result = valid_emails.find(&:primary?)
    result ||= valid_emails.first
    result
  end
end
