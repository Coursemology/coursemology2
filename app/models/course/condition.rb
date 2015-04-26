class Course::Condition < ActiveRecord::Base
  actable
  belongs_to :course
  belongs_to :conditional, polymorphic: true
  belongs_to :creator, class_name: User.name
  belongs_to :updater, class_name: User.name
end
