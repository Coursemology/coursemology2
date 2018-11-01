# frozen_string_literal: true
class Course::Discussion::Topic::Subscription < ApplicationRecord
  validates :topic, presence: true
  validates :user, presence: true
  validates :topic_id, uniqueness: { scope: [:user_id], if: -> { user_id? && topic_id_changed? } }
  validates :user_id, uniqueness: { scope: [:topic_id], if: -> { topic_id? && user_id_changed? } }

  belongs_to :topic, inverse_of: :subscriptions
  belongs_to :user, inverse_of: nil
end
