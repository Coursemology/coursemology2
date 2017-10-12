# frozen_string_literal: true
class Course::Forum::Subscription < ApplicationRecord
  belongs_to :forum, inverse_of: :subscriptions
  belongs_to :user, inverse_of: nil
end
