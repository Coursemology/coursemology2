# Represents an assessment in Coursemology, as well as the enclosing module for associated models.
#
# An assessment is a collection of questions that can be asked.
class Course::Assessment < ActiveRecord::Base
  acts_as_lesson_plan_item

  belongs_to :tab

  has_many :questions
  has_many :submissions

  def to_partial_path
    'course/assessment/assessments/assessment'.freeze
  end
end
