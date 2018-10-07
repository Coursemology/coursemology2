# frozen_string_literal: true
class Course::Assessment::Question::MultipleResponse < ApplicationRecord
  acts_as :question, class_name: Course::Assessment::Question.name

  enum grading_scheme: [:all_correct, :any_correct]

  validate :validate_multiple_choice_has_solution, if: :multiple_choice?
  validates_presence_of :grading_scheme

  has_many :options, class_name: Course::Assessment::Question::MultipleResponseOption.name,
                     dependent: :destroy, foreign_key: :question_id, inverse_of: :question

  accepts_nested_attributes_for :options, allow_destroy: true

  # A Multiple Response Question is considered to be a Multiple Choice Question (MCQ)
  # if and only if it has an "any correct" grading scheme. The case where "any correct"
  # questions are not MCQs (i.e. students select a subset of the correct answer by checking
  # two or more option) is weak. MCQs can be graded with either scheme, but using
  # "any correct" allows it to have more than one correct answer.
  alias_method :multiple_choice?, :any_correct?

  def auto_gradable?
    true
  end

  def auto_grader
    Course::Assessment::Answer::MultipleResponseAutoGradingService.new
  end

  def attempt(submission, last_attempt = nil)
    answer =
      Course::Assessment::Answer::MultipleResponse.new(submission: submission, question: question)
    last_attempt&.answer_options&.each do |answer_option|
      answer.answer_options.build(option_id: answer_option.option_id)
    end

    answer.acting_as
  end

  def initialize_duplicate(duplicator, other)
    copy_attributes(other)

    self.options = duplicator.duplicate(other.options)
  end

  # returns the type of question as multiple response or multiple choice
  def question_type
    if multiple_choice?
      I18n.t('course.assessment.question.multiple_responses.question_type.multiple_choice')
    else
      I18n.t('course.assessment.question.multiple_responses.question_type.multiple_response')
    end
  end

  private

  def validate_multiple_choice_has_solution
    errors.add(:options, :no_correct_option) if options.select(&:correct?).empty?
  end
end
