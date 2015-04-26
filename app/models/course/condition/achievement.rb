class Course::Condition::Achievement < ActiveRecord::Base
  acts_as :condition, class_name: Course::Condition.name
  belongs_to :achievement, class_name: Course::Achievement.name
end
