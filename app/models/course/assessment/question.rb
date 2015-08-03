class Course::Assessment::Question < ActiveRecord::Base
  actable

  belongs_to :assessment, inverse_of: :questions
  has_and_belongs_to_many :tags

  delegate :to_partial_path, to: :actable

  # Attempts the given question in the submission. This builds a new answer for the current
  # question.
  #
  # @param [Course::Assessment::Submission] submission The submission which the answer should
  #   belong to.
  # @return [Course::Assessment::Answer] The answer corresponding to the question. It is required
  #   that the {Course::Assessment::Answer#question} property be the same as +self+. The result
  #   should not be persisted.
  def attempt(submission)
    return actable.attempt(submission) if actable
    fail NotImplementedError, 'Questions must implement the #attempt method for submissions.'
  end
end
