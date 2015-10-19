class Course::Forum::Subscription < ActiveRecord::Base
  belongs_to :forum, inverse_of: :subscriptions
  belongs_to :user, inverse_of: nil
end
