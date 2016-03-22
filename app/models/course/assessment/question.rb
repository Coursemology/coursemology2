# frozen_string_literal: true
class Course::Assessment::Question < ActiveRecord::Base
  actable
  has_many_attachments

  belongs_to :assessment, inverse_of: :questions
  has_and_belongs_to_many :skills

  default_scope { order(weight: :asc) }

  delegate :to_partial_path, to: :actable

  # Checks if the given question is auto gradable. This defaults to false if the specific
  # question does not implement auto grading. If this returns true, +auto_grader+ is guaranteed
  # to return a valid grader service.
  #
  # Different instances of a question can have different auto gradability.
  #
  # @return [Boolean] True if the question supports auto grading.
  def auto_gradable?
    actable.present? && actable.self_respond_to?(:auto_gradable?) ? actable.auto_gradable? : false
  end

  # Gets an instance of the auto grader suitable for use with this question.
  #
  # @return [Course::Assessment::Answer::AutoGradingService] An auto grading service.
  # @raise [NotImplementedError] The question does not have a suitable auto grader for use.
  def auto_grader
    raise NotImplementedError unless auto_gradable? && actable.self_respond_to?(:auto_grader)
    actable.auto_grader || (raise NotImplementedError)
  end

  # Attempts the given question in the submission. This builds a new answer for the current
  # question.
  #
  # @param [Course::Assessment::Submission] submission The submission which the answer should
  #   belong to.
  # @return [Course::Assessment::Answer] The answer corresponding to the question. It is required
  #   that the {Course::Assessment::Answer#question} property be the same as +self+. The result
  #   should not be persisted.
  def attempt(submission)
    return actable.attempt(submission) if actable && actable.self_respond_to?(:attempt)
    raise NotImplementedError, 'Questions must implement the #attempt method for submissions.'
  end

  # Test if the question is the last question of the assessment.
  #
  # @return [Boolean] True if the question is the last question, otherwise False.
  def last_question?
    assessment.questions.last == self
  end
end
