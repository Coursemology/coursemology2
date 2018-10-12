# frozen_string_literal: true
class InstanceUser < ApplicationRecord
  include InstanceUserSearchConcern
  acts_as_tenant :instance, inverse_of: :instance_users

  enum role: { normal: 0, instructor: 1, administrator: 2 }
  belongs_to :user, inverse_of: :instance_users

  scope :ordered_by_username, -> { joins(:user).merge(User.order(name: :asc)) }
  scope :active_in_past_7_days, -> { where('last_active_at > ?', 7.days.ago) }

  def self.search_and_ordered_by_username(keyword)
    keyword.blank? ? ordered_by_username : search(keyword).group('users.name').ordered_by_username
  end
end
