# frozen_string_literal: true
class Course::Assessment::Marketplace::AccessBlock < ApplicationRecord
  belongs_to :user, inverse_of: false
  belongs_to :creator, class_name: 'User', inverse_of: false

  # Paired with the DB unique index on user_id: a user is blocked at most once.
  validates :user_id, uniqueness: true

  # Whether +user+ has been individually disabled from the marketplace. Global (not tenant-scoped),
  # mirroring AllowlistRule.
  # @param [User] user
  # @return [Boolean]
  def self.blocked?(user)
    return false unless user

    where(user_id: user.id).exists?
  end

  # @return [Array<Integer>] user ids of every block (for per-page status annotation).
  def self.blocked_user_ids
    pluck(:user_id)
  end
end
