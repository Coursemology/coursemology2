class Course::Condition::Level < ActiveRecord::Base
  acts_as_condition
  validates :minimum_level, numericality: { greater_than: 0 }
end
