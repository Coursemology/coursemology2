# frozen_string_literal: true
class Course::Assessment::Question::TextResponseComprehensionSolution < ApplicationRecord
  self.table_name = 'course_assessment_question_text_response_compre_solutions'

  enum solution_type: [:compre_keyword, :compre_lifted_word]

  before_validation :remove_blank_solution,
                    :set_dummy_solution_lemma,
                    :strip_whitespace_solution,
                    :strip_whitespace_solution_lemma

  validate :validate_solution_lemma_empty

  belongs_to :point, class_name: Course::Assessment::Question::TextResponseComprehensionPoint.name,
                     inverse_of: :solutions

  def auto_gradable_solution?
    !solution.empty?
  end

  def initialize_duplicate(duplicator, other)
    self.point = duplicator.duplicate(other.point)
  end

  private

  def remove_blank_solution
    solution.reject!(&:blank?)
  end

  # TODO: Remove this function when lemmatiser is implemented
  def set_dummy_solution_lemma
    self.solution_lemma = solution
  end

  def strip_whitespace_solution
    solution.each(&:strip!)
  end

  def strip_whitespace_solution_lemma
    solution_lemma.each(&:strip!)
  end

  # add custom error message for `solution_lemma` instead of default :blank
  def validate_solution_lemma_empty
    errors.add(:solution_lemma, :solution_lemma_empty) if solution_lemma.empty?
  end
end
