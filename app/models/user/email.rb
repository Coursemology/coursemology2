# frozen_string_literal: true
# Represents an email address belonging to a user.
class User::Email < ApplicationRecord
  before_validation(on: :create) do
    remove_existing_unconfirmed_secondary_email
  end
  after_save :accept_all_pending_invitations
  after_destroy :set_new_user_primary_email, if: :primary?

  validates :primary, inclusion: [true, false]
  validates :confirmation_token, length: { maximum: 255 }, allow_nil: true
  validates :confirmation_token, uniqueness: { if: :confirmation_token_changed? }, allow_nil: true
  validates :user_id, uniqueness: { scope: [:primary], allow_nil: true,
                                    conditions: -> { where(primary: 'true') }, if: :user_id_changed? }

  belongs_to :user, inverse_of: :emails

  scope :confirmed, -> { where.not(confirmed_at: nil) }

  private

  def remove_existing_unconfirmed_secondary_email
    existing_email = User::Email.where(email: email, primary: false).first
    existing_email.destroy! if existing_email && !existing_email.confirmed?
  end

  def accept_all_pending_invitations
    return unless confirmed?

    all_unconfirmed_invitations = Course::UserInvitation.where(email: email).unconfirmed

    all_unconfirmed_invitations.each do |unconfirmed_invitation|
      if enrolled_course_ids.include?(unconfirmed_invitation.course_id)
        unconfirmed_invitation.confirm!(confirmer: user)
        next
      end
      user.build_course_user_from_invitation(unconfirmed_invitation)
      unconfirmed_invitation.confirm!(confirmer: user) if user.save && user.persisted?
    end
  end

  def set_new_user_primary_email
    return if user.destroying?

    return if user.set_next_email_as_primary

    errors.add(:base, I18n.t('errors.user.emails.no_confirmed_emails'))
    raise ActiveRecord::Rollback
  end

  def enrolled_course_ids
    user.reload.course_ids
  end
end
