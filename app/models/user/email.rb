# frozen_string_literal: true
# Represents an email address belonging to a user.
class User::Email < ActiveRecord::Base
  after_destroy :set_new_user_primary_email, if: :primary?

  schema_validations except: [:primary, :email]
  validates :primary, inclusion: [true, false]
  validates :primary, uniqueness: { scope: [:user_id], conditions: -> { where(primary: true) } }

  belongs_to :user, inverse_of: :emails

  # Set the email as primary. This method would cause the email record to be directly updated.
  #
  # @return [Boolean] True if transaction was done successfully, otherwise nil.
  def primary!
    User::Email.transaction do
      raise ActiveRecord::Rollback unless user.unset_primary_email
      raise ActiveRecord::Rollback unless update_attributes(primary: true)
      true
    end
  end

  private

  def set_new_user_primary_email
    return if user.destroying?
    raise ActiveRecord::Rollback unless user.set_next_email_as_primary
  end
end
