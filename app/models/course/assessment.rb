# Represents an assessment in Coursemology, as well as the enclosing module for associated models.
#
# An assessment is a collection of questions that can be asked.
class Course::Assessment < ActiveRecord::Base
  acts_as_lesson_plan_item

  belongs_to :tab, inverse_of: :assessments

  has_many :questions, dependent: :destroy
  has_many :multiple_response_questions,
           through: :questions, source: :actable,
           source_type: Course::Assessment::Question::MultipleResponse.name
  has_many :submissions, dependent: :destroy

  def self.use_relative_model_naming?
    true
  end

  def to_partial_path
    'course/assessment/assessments/assessment'.freeze
  end
end
