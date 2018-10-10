# frozen_string_literal: true
class Course::Forum::Subscription < ApplicationRecord
  validates :forum, presence: true
  validates :user, presence: true
  validates :forum_id, uniqueness: { scope: [:user_id], allow_nil: true,
                                     if: -> { user_id? && forum_id_changed? } }
  validates :user_id, uniqueness: { scope: [:forum_id], allow_nil: true,
                                    if: -> { forum_id? && user_id_changed? } }

  belongs_to :forum, inverse_of: :subscriptions
  belongs_to :user, inverse_of: nil
end
