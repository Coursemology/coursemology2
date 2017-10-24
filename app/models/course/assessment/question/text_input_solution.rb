# frozen_string_literal: true
class Course::Assessment::Question::TextInputSolution < ActiveRecord::Base
  enum solution_type: [:exact_match, :keyword, :compre_lifted_word, :compre_keyword]

  before_validation :strip_whitespace_solution, :strip_whitespace_solution_lemma
  validate :validate_solution_grade, :validate_solution_grade_is_zero_for_compre_lifted_word

  belongs_to :point, class_name: Course::Assessment::Question::TextInputPoint.name,
                     inverse_of: :solutions

  def auto_gradable_solution?
    !solution.empty?
  end

  def initialize_duplicate(duplicator, other)
    self.point = duplicator.duplicate(other.point)
  end

  private

  def strip_whitespace_solution
    solution.each(&:strip!) unless solution.empty?
  end

  def strip_whitespace_solution_lemma
    solution_lemma.each(&:strip!) if (compre_keyword? || compre_lifted_word?) && !solution_lemma.empty?
  end

  def validate_solution_grade
    errors.add(:grade, :invalid_solution_grade) if grade > point.maximum_point_grade
  end

  def validate_solution_grade_is_zero_for_compre_lifted_word
    errors.add(:grade, :invalid_solution_grade_compre_lifted_word) if
      compre_lifted_word? && grade != 0
  end
end
