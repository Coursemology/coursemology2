class Course::Condition < ActiveRecord::Base
  actable

  belongs_to :course
  belongs_to :conditional, polymorphic: true
end
