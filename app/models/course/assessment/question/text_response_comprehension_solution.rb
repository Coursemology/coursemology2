# frozen_string_literal: true
class Course::Assessment::Question::TextResponseComprehensionSolution < ApplicationRecord
  self.table_name = 'course_assessment_question_text_response_compre_solutions'

  enum solution_type: [:compre_keyword, :compre_lifted_word]

  before_validation :sanitise_solution_and_derive_lemma

  validate :validate_solution_lemma_empty,
           :validate_information_empty
  validates :solution_type, presence: true
  validates :solution, presence: true
  validates :solution_lemma, presence: true
  validates :point, presence: true

  belongs_to :point, class_name: 'Course::Assessment::Question::TextResponseComprehensionPoint',
                     inverse_of: :solutions

  def auto_gradable_solution?
    !solution.empty?
  end

  def initialize_duplicate(duplicator, other)
    self.point = duplicator.duplicate(other.point)
  end

  private

  def sanitise_solution_and_derive_lemma
    remove_blank_solution
    strip_whitespace_solution
    convert_solution_to_lemma
    strip_whitespace_solution_lemma
    strip_whitespace_information
  end

  def remove_blank_solution
    solution.reject!(&:blank?)
  end

  def strip_whitespace_solution
    solution.each(&:strip!)
  end

  def convert_solution_to_lemma
    lemmatiser = Course::Assessment::Question::TextResponseLemmaService.new
    self.solution_lemma = lemmatiser.lemmatise(solution)
  end

  def strip_whitespace_solution_lemma
    solution_lemma.each(&:strip!)
  end

  def strip_whitespace_information
    information&.strip!
  end

  # add custom error message for `solution_lemma` instead of default :blank
  def validate_solution_lemma_empty
    errors.add(:solution_lemma, :solution_lemma_empty) if solution_lemma.empty?
  end

  def validate_information_empty
    errors.add(:information, :information_empty) if compre_keyword? && information.empty?
  end
end
