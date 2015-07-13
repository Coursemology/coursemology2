class Course::Condition::Achievement < ActiveRecord::Base
  acts_as_condition
  belongs_to :achievement, class_name: Course::Achievement.name, inverse_of: false

  default_scope { includes(:achievement) }
end
