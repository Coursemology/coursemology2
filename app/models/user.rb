# frozen_string_literal: true
# Represents a user in the application. Users are shared across all instances.
class User < ApplicationRecord
  SYSTEM_USER_ID = 0
  DELETED_USER_ID = -1

  include UserSearchConcern
  include TimeZoneConcern
  include Generic::CollectionConcern
  model_stamper
  acts_as_reader
  mount_uploader :profile_photo, ImageUploader

  enum :role, { normal: 0, administrator: 1 }

  AVAILABLE_LOCALES = I18n.available_locales.map(&:to_s)

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

  validates :email, :encrypted_password, absence: true, if: :built_in?
  validates :name, length: { maximum: 255 }, presence: true
  validates :role, presence: true
  validates :time_zone, length: { maximum: 255 }, allow_nil: true
  validates :reset_password_token, length: { maximum: 255 }, allow_nil: true,
                                   uniqueness: { if: :reset_password_token_changed? }
  validates :locale, inclusion: { in: AVAILABLE_LOCALES }, allow_nil: true

  has_many :emails, -> { order('primary' => :desc) }, class_name: 'User::Email',
                                                      inverse_of: :user, dependent: :destroy
  # This order need to be preserved, so that :emails association can be detected by
  # devise-multi_email correctly.
  include UserAuthenticationConcern

  has_one :primary_email, -> { where(primary: true) }, class_name: 'User::Email', inverse_of: :user

  has_many :instance_users, dependent: :destroy
  has_many :instances, through: :instance_users
  has_many :identities, dependent: :destroy, class_name: 'User::Identity'
  has_many :activities, inverse_of: :actor, dependent: :destroy, foreign_key: 'actor_id'
  has_many :notifications, dependent: :destroy, class_name: 'UserNotification',
                           inverse_of: :user do
    include UserNotificationsConcern
  end
  has_many :course_enrol_requests, dependent: :destroy, class_name: 'Course::EnrolRequest',
                                   inverse_of: :user
  has_many :course_users, dependent: :destroy
  has_many :courses, through: :course_users
  has_many :todos, class_name: 'Course::LessonPlan::Todo', inverse_of: :user, dependent: :destroy
  has_many :question_bundle_assignments, class_name: 'Course::Assessment::QuestionBundleAssignment',
                                         inverse_of: :user, dependent: :destroy

  has_one :cikgo_user, dependent: :destroy, inverse_of: :user

  # Both tables FK to users with no ON DELETE, so without these the admin panel's delete-user
  # action dies with PG::ForeignKeyViolation for anyone who is allow-listed or blocked. Destroying
  # is the right semantic for both: each row is *about* this user and means nothing without them.
  has_many :marketplace_allowlist_rules, class_name: 'Course::Assessment::Marketplace::AllowlistRule',
                                         inverse_of: false, dependent: :destroy
  has_many :marketplace_access_blocks, class_name: 'Course::Assessment::Marketplace::AccessBlock',
                                       inverse_of: false, dependent: :destroy
  # Blocks this user ISSUED. Not `dependent:` anything — destroying them would silently restore
  # marketplace access for everyone this admin ever blocked, and `creator_id` is NOT NULL so it
  # cannot be nullified either. `reassign_issued_marketplace_blocks` hands authorship to the
  # Deleted user instead, which keeps the block standing and satisfies the FK.
  has_many :issued_marketplace_access_blocks, class_name: 'Course::Assessment::Marketplace::AccessBlock',
                                              foreign_key: :creator_id, inverse_of: false,
                                              dependent: nil
  before_destroy :reassign_issued_marketplace_blocks

  accepts_nested_attributes_for :emails

  scope :ordered_by_name, -> { order(:name) }
  scope :human_users, -> { where.not(id: [User::SYSTEM_USER_ID, User::DELETED_USER_ID]) }
  scope :active_in_past_7_days, (lambda do
    where(id: InstanceUser.unscoped.active_in_past_7_days.select(:user_id).distinct)
  end)
  scope :with_email_addresses, (lambda do |email_addresses|
    includes(:emails).joins(:emails).
      where('user_emails.email IN (?) AND user_emails.confirmed_at IS NOT NULL',
            email_addresses)
  end)

  # Gets whether the current user is one of the the built in users.
  #
  # @return [Boolean]
  def built_in?
    id == User::SYSTEM_USER_ID || id == User::DELETED_USER_ID
  end

  # Whether the user manages or owns at least one course, in any instance. This is the baseline
  # capability for the assessment marketplace: browsing is then further gated by the allow-list.
  # `course_users` is not tenant-scoped (CourseUser has no acts_as_tenant), so this correctly
  # spans all instances.
  #
  # @return [Boolean]
  def course_manager_or_owner?
    course_users.managers.exists?
  end

  # Whether the user is an instructor or administrator InstanceUser in ANY instance. This is the
  # second baseline capability for the assessment marketplace, a peer of course_manager_or_owner?.
  # `instance_users` IS tenant-scoped (acts_as_tenant), so bypass the tenant to span all instances.
  #
  # @return [Boolean]
  def instance_instructor_or_administrator?
    ActsAsTenant.without_tenant do
      instance_users.where(role: [:instructor, :administrator]).exists?
    end
  end
  # Pick the default email and set it as primary email. This method would immediately set the
  # attributes in the database.
  #
  # @return [Boolean] True if the new email was set as primary, false if failed or next email
  #   cannot be found.
  def set_next_email_as_primary
    return false unless default_email_record

    default_email_record.update(primary: true)
  end

  # Update the user using the info from invitation.
  #
  # @param [Course::UserInvitation|Instance::UserInvitation]
  def build_from_invitation(invitation)
    self.name = invitation.name
    self.email = invitation.email
    skip_confirmation!
    case invitation.invitation_key.first
    when Course::UserInvitation::INVITATION_KEY_IDENTIFIER
      build_course_user_from_invitation(invitation)
    when Instance::UserInvitation::INVITATION_KEY_IDENTIFIER
      @instance_invitation = invitation
    end
  end

  def build_course_user_from_invitation(invitation)
    course_users.build(course: invitation.course,
                       name: invitation.name,
                       role: invitation.role,
                       phantom: invitation.phantom,
                       timeline_algorithm: invitation.timeline_algorithm ||
                          invitation.course&.default_timeline_algorithm,
                       external_id: invitation.external_id.presence,
                       creator: self,
                       updater: self)
  end

  private

  # Hands any marketplace blocks this user issued to the Deleted user, so destroying an admin does
  # not lift the blocks they put in place (nor trip the NOT NULL FK on `creator_id`).
  def reassign_issued_marketplace_blocks
    return if id == User::DELETED_USER_ID

    issued_marketplace_access_blocks.update_all(creator_id: User::DELETED_USER_ID)
  end

  # Gets the default email address record.
  #
  # @return [User::Email] The user's primary email address record.
  def default_email_record
    valid_emails = emails.confirmed.each.select do |email_record|
      !email_record.destroyed? && !email_record.marked_for_destruction?
    end
    result = valid_emails.find(&:primary?)
    result ||= valid_emails.first
    result
  end
end
