class Course::Achievement < ActiveRecord::Base
  stampable

  has_many :requirements, as: :has_requirement
  belongs_to :creator, class_name: User.name
  belongs_to :course, inverse_of: :achievements

  default_scope { order(weight: :asc) }
end
