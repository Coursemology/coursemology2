# frozen_string_literal: true
class Course::UserInvitation < ApplicationRecord
  after_initialize :generate_invitation_key, if: :new_record?
  after_initialize :set_defaults, if: :new_record?
  before_validation :set_defaults, if: :new_record?

  validates :email, format: { with: Devise.email_regexp }, if: :email_changed?
  validates :name, presence: true
  validates :role, presence: true
  validates :phantom, inclusion: [true, false]
  validate :no_existing_unconfirmed_invitation

  enum role: CourseUser.roles

  belongs_to :course, inverse_of: :invitations
  belongs_to :confirmer, class_name: User.name, inverse_of: nil, optional: true

  # Invitations that haven't been confirmed, i.e. pending the user's acceptance.
  scope :unconfirmed, -> { where(confirmed_at: nil) }

  # Finds an invitation that matches one of the user's registered emails.
  #
  # @param [User] user
  def self.for_user(user)
    find_by(email: user.emails.confirmed.select(:email))
  end

  def confirm!(confirmer:)
    self.confirmed_at = Time.zone.now
    self.confirmer = confirmer
    save!
  end

  def confirmed?
    confirmed_at.present?
  end

  private

  # Generates the invitation key. All invitation keys generated start with I so we can
  # distinguish it from other kinds of keys in future.
  #
  # @return [void]
  def generate_invitation_key
    self.invitation_key ||= 'I' + SecureRandom.base64(8)
  end

  # Sets the default for non-null fields.
  # Currently sets the role attribute to :student if null, and phantom to false if null.
  #
  # @return [void]
  def set_defaults
    self.role ||= Course::UserInvitation.roles[:student]
    self.phantom ||= false
  end

  # Checks whether there are existing unconfirmed invitations with the same email.
  # Scope excludes the own invitation object.
  def no_existing_unconfirmed_invitation
    return unless Course::UserInvitation.where(course_id: course_id, email: email).
                    where.not(id: id).unconfirmed.exists?
    errors.add(:base, :existing_invitation)
  end
end
