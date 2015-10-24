class Course::Discussion::Topic < ActiveRecord::Base
  actable

  has_many :posts, dependent: :destroy, inverse_of: :topic
  has_many :subscriptions, dependent: :destroy, inverse_of: :topic

  accepts_nested_attributes_for :posts
end
