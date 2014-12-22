class Course < ActiveRecord::Base
  acts_as_tenant(:instance)
  stampable

  enum status: { closed: 0, published: 1, opened: 2 }
  belongs_to :creator, class_name: User.name
  has_many :course_users, inverse_of: :course, dependent: :destroy
  has_many :users, through: :course_users
end
