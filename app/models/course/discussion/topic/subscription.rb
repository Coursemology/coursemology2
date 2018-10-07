# frozen_string_literal: true
class Course::Discussion::Topic::Subscription < ApplicationRecord
  validates_presence_of :topic
  validates_presence_of :user
  validates_uniqueness_of :topic_id, scope: [:user_id], allow_nil: true,
                                     if: -> { user_id? && topic_id_changed? }
  validates_uniqueness_of :user_id, scope: [:topic_id], allow_nil: true,
                                    if: -> { topic_id? && user_id_changed? }

  belongs_to :topic, inverse_of: :subscriptions
  belongs_to :user, inverse_of: nil
end
