# frozen_string_literal: true
# Represents a user in the application. Users are shared across all instances.
class User < ActiveRecord::Base
  SYSTEM_USER_ID = 0
  DELETED_USER_ID = -1

  include UserSearchConcern
  model_stamper
  acts_as_reader
  mount_uploader :profile_photo, ImageUploader

  enum role: { normal: 0, administrator: 1 }

  class << self
    # Finds the System user.
    #
    # This account cannot be logged into (because it has no email and a null password), and the
    # User Authentication Concern explicitly rejects any user with the system user ID.
    #
    # @return [User]
    def system
      @system ||= find(User::SYSTEM_USER_ID)
      raise 'No system user. Did you run rake db:seed?' unless @system
      @system
    end

    # Finds the Deleted user.
    #
    # Same as the System user, this account cannot be logged into.
    #
    # @return [User]
    def deleted
      @deleted ||= find(User::DELETED_USER_ID)
      raise 'No deleted user. Did you run rake db:seed?' unless @deleted
      @deleted
    end
  end

  validates :email, :encrypted_password, :authentication_token, absence: true, if: :built_in?
  schema_validations except: [:encrypted_password]
  validates :time_zone, inclusion: { in: ActiveSupport::TimeZone.zones_map.keys }, allow_nil: true

  has_many :emails, -> { order('primary' => :desc) }, class_name: User::Email.name,
                                                      inverse_of: :user, dependent: :destroy
  # This order need to be preserved, so that :emails association can be detected by
  # devise-multi_email correctly.
  include UserAuthenticationConcern

  has_many :instance_users, dependent: :destroy
  has_many :instances, through: :instance_users
  has_many :identities, dependent: :destroy, class_name: User::Identity.name
  has_many :activities, inverse_of: :actor, dependent: :destroy, foreign_key: 'actor_id'.freeze
  has_many :notifications, dependent: :destroy, class_name: UserNotification.name,
                           inverse_of: :user do
    include UserNotificationsConcern
  end
  has_many :course_enrol_requests, dependent: :destroy, class_name: Course::EnrolRequest.name,
                                   inverse_of: :user
  has_many :course_users, dependent: :destroy
  has_many :courses, through: :course_users
  has_many :todos, class_name: Course::LessonPlan::Todo.name, inverse_of: :user, dependent: :destroy

  accepts_nested_attributes_for :emails

  scope :ordered_by_name, -> { order(:name) }
  scope :human_users, -> { where.not(id: [User::SYSTEM_USER_ID, User::DELETED_USER_ID]) }

  # Gets whether the current user is one of the the built in users.
  #
  # @return [Boolean]
  def built_in?
    id == User::SYSTEM_USER_ID || id == User::DELETED_USER_ID
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

  # Update the user using the info from invitation.
  #
  # @param [Course::UserInvitation]
  def build_from_invitation(invitation)
    self.name = invitation.name
    self.email = invitation.email
    skip_confirmation!
    course_users.build(course: invitation.course, name: invitation.name,
                       creator: self, updater: self)
  end

  private

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
