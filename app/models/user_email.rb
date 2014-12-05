# Represents an email address belonging to a user.
class UserEmail < ActiveRecord::Base
  belongs_to :user

  validates_uniqueness_of :email
  validates_format_of :email, with: Devise::email_regexp
end
