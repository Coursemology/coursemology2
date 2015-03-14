# Represents an email address belonging to a user.
class UserEmail < ActiveRecord::Base
  belongs_to :user, inverse_of: :emails

  validates :email, uniqueness: { case_sensitive: false }
  validates :email, format: Devise.email_regexp
end
