# Represents an email address belonging to a user.
class User::Email < ActiveRecord::Base
  after_destroy :set_new_user_primary_email, if: :primary?
  devise :confirmable

  schema_validations except: :primary
  validates :primary, inclusion: [true, false]
  validates :primary, uniqueness: { scope: [:user_id], conditions: -> { where(primary: true) } }
  validates :email, uniqueness: { case_sensitive: false }
  validates :email, format: Devise.email_regexp

  belongs_to :user, inverse_of: :emails

  # Set the email as primary. This method would cause the email record to be directly updated.
  #
  # @return [Boolean] True if transaction was done successfully, otherwise nil.
  def primary!
    User::Email.transaction do
      fail ActiveRecord::Rollback unless user.unset_primary_email
      fail ActiveRecord::Rollback unless update_attributes(primary: true)
      true
    end
  end

  def devise_scope
    :user
  end

  private

  def set_new_user_primary_email
    return if user.destroying?
    fail ActiveRecord::Rollback unless user.set_next_email_as_primary
  end
end
