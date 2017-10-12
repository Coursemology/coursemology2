# frozen_string_literal: true
class Course::Discussion::Topic::Subscription < ApplicationRecord
  belongs_to :topic, inverse_of: :subscriptions
  belongs_to :user, inverse_of: nil
end
