class Course::Condition < ActiveRecord::Base
  actable

  belongs_to :course, inverse_of: false
  belongs_to :conditional, polymorphic: true

  delegate :satisfied_by?, to: :actable

  ALL_CONDITIONS = [
    Course::Condition::Achievement.name,
    Course::Condition::Assessment.name,
    Course::Condition::Level.name]
end
