class Course < ActiveRecord::Base
  acts_as_tenant(:instance)

  enum status: { closed: 0, published: 1, opened: 2 }
  belongs_to :creator, class_name: User.name
end
