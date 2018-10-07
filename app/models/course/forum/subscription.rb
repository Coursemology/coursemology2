# frozen_string_literal: true
class Course::Forum::Subscription < ApplicationRecord
  validates_presence_of :forum
  validates_presence_of :user
  validates_uniqueness_of :forum_id, scope: [:user_id], allow_nil: true,
                                     if: -> { user_id? && forum_id_changed? }
  validates_uniqueness_of :user_id, scope: [:forum_id], allow_nil: true,
                                    if: -> { forum_id? && user_id_changed? }

  belongs_to :forum, inverse_of: :subscriptions
  belongs_to :user, inverse_of: nil
end
