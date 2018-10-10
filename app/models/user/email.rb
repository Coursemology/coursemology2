# frozen_string_literal: true
# Represents an email address belonging to a user.
class User::Email < ApplicationRecord
  after_destroy :set_new_user_primary_email, if: :primary?

  validates :primary, inclusion: [true, false]
  validates :confirmation_token, length: { maximum: 255 }, allow_nil: true
  validates :confirmation_token, uniqueness: { if: :confirmation_token_changed? }, allow_nil: true
  validates :user_id, uniqueness: { scope: [:primary], allow_nil: true,
                                    conditions: -> { where(primary: 'true') }, if: :user_id_changed? }

  belongs_to :user, inverse_of: :emails

  scope :confirmed, -> { where.not(confirmed_at: nil) }

  private

  def set_new_user_primary_email
    return if user.destroying?
    raise ActiveRecord::Rollback unless user.set_next_email_as_primary
  end
end
