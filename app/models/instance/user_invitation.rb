# frozen_string_literal: true
class Instance::UserInvitation < ApplicationRecord
  acts_as_tenant :instance, inverse_of: :invitations

  after_initialize :generate_invitation_key, if: :new_record?
  after_initialize :set_defaults, if: :new_record?

  validates :email, format: { with: Devise.email_regexp }, if: :email_changed?
  validates :name, presence: true
  validates :role, presence: true
  validates :generate_invitation_key, presence: true
  validate :no_existing_unconfirmed_invitation

  enum role: InstanceUser.roles

  belongs_to :instance, inverse_of: :invitations
  belongs_to :confirmer, class_name: User.name, inverse_of: nil, optional: true

  # Invitations that haven't been confirmed, i.e. pending the user's acceptance.
  scope :unconfirmed, -> { where(confirmed_at: nil) }

  INVITATION_KEY_IDENTIFIER = 'J'

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

  # Generates the invitation key. instance invitation keys generated start with J.
  #
  # @return [void]
  def generate_invitation_key
    self.invitation_key ||= INVITATION_KEY_IDENTIFIER + SecureRandom.base64(8)
  end

  # Sets the default for non-null fields.
  # Currently sets the role attribute to :normal if null.
  #
  # @return [void]
  def set_defaults
    self.role ||= Instance::UserInvitation.roles[:normal]
  end

  # Checks whether there are existing unconfirmed invitations with the same email.
  # Scope excludes the own invitation object.
  def no_existing_unconfirmed_invitation
    return unless Instance::UserInvitation.where(instance_id: instance_id, email: email).
                  where.not(id: id).unconfirmed.exists?

    errors.add(:base, :existing_invitation)
  end
end
