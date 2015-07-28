class Course::Condition < ActiveRecord::Base
  actable

  belongs_to :course, inverse_of: false
  belongs_to :conditional, polymorphic: true
end
