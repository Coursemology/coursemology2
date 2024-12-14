# frozen_string_literal: true
class InstanceUser < ApplicationRecord
  include InstanceUserSearchConcern
  include Generic::CollectionConcern
  acts_as_tenant :instance, inverse_of: :instance_users
  after_initialize :set_defaults, if: :new_record?

  enum :role, { normal: 0, instructor: 1, administrator: 2 }

  validates :role, presence: true
  validates :instance, presence: true
  validates :user, presence: true
  validates :instance_id, uniqueness: { scope: [:user_id], if: -> { user_id? && instance_id_changed? } }
  validates :user_id, uniqueness: { scope: [:instance_id], if: -> { instance_id? && user_id_changed? } }

  belongs_to :user, inverse_of: :instance_users

  scope :ordered_by_username, -> { joins(:user).merge(User.order(name: :asc)) }
  scope :human_users, -> { where.not(user_id: [User::SYSTEM_USER_ID, User::DELETED_USER_ID]) }
  scope :active_in_past_7_days, -> { where('last_active_at > ?', 7.days.ago) }

  def self.search_and_ordered_by_username(keyword)
    keyword.blank? ? ordered_by_username : search(keyword).group('users.name').ordered_by_username
  end

  private

  def set_defaults
    self.role ||= InstanceUser.roles[:normal]
  end
end
