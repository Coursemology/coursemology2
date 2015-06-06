# Represents an email address belonging to a user.
class User::Email < ActiveRecord::Base
  validates :email, uniqueness: { case_sensitive: false }
  validates :email, format: Devise.email_regexp

  belongs_to :user, inverse_of: :emails
end
