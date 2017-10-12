# frozen_string_literal: true
# Represents an email address belonging to a user.
class User::Email < ApplicationRecord
  after_destroy :set_new_user_primary_email, if: :primary?

  schema_validations except: [:primary, :email]
  validates :primary, inclusion: [true, false]

  belongs_to :user, inverse_of: :emails

  scope :confirmed, -> { where.not(confirmed_at: nil) }

  private

  def set_new_user_primary_email
    return if user.destroying?
    raise ActiveRecord::Rollback unless user.set_next_email_as_primary
  end
end
