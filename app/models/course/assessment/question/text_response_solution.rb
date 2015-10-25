class Course::Assessment::Question::TextResponseSolution < ActiveRecord::Base
  enum solution_type: [:exact_match, :keyword]

  validate :validate_grade

  belongs_to :question, class_name: Course::Assessment::Question::TextResponse.name,
                        inverse_of: :solutions

  private

  def validate_grade
    errors.add(:grade, :invalid_grade) if grade > question.maximum_grade
  end
end
