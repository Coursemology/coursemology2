# frozen_string_literal: true
class Course::UserInvitation < ActiveRecord::Base
  after_initialize :generate_invitation_key, if: :new_record?

  schema_validations auto_create: false
  validates :email, uniqueness: { scope: :course_id },
                    format: { with: Devise.email_regexp },
                    if: :email_changed?

  belongs_to :course, inverse_of: :invitations

  # Invitations that haven't been confirmed, i.e. pending the user's acceptance.
  scope :unconfirmed, -> { where(confirmed_at: nil) }

  # Finds an invitation that matches one of the user's registered emails.
  #
  # @param [User] user
  def self.for_user(user)
    find_by(email: user.emails.confirmed.select(:email))
  end

  def confirm!
    self.confirmed_at = Time.zone.now
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
    self.invitation_key ||= 'I'.freeze + SecureRandom.base64(8)
  end
end
