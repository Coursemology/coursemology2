class Activity < ActiveRecord::Base
  belongs_to :object, polymorphic: true
  belongs_to :actor, inverse_of: :activities, class_name: User.name
  has_many :course_notifications, inverse_of: :activity, dependent: :destroy
  has_many :user_notifications, inverse_of: :activity, dependent: :destroy
end
