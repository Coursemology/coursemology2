class Course::Requirement < ActiveRecord::Base
  actable
  belongs_to :has_requirement, polymorphic: true # naming is hard
end
