# frozen_string_literal: true
class Course::Assessment::Question < ApplicationRecord
  actable
  has_many_attachments

  before_validation :set_defaults, if: :new_record?

  belongs_to :assessment, inverse_of: :questions
  has_many :answers, class_name: Course::Assessment::Answer.name, dependent: :destroy,
                     inverse_of: :question
  has_and_belongs_to_many :skills
  has_many :submission_questions, class_name: Course::Assessment::SubmissionQuestion.name,
                                  dependent: :destroy, inverse_of: :question

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
  # @param [Course::Assessment::Answer|nil] last_attempt If last_attempt is given, fields in the
  #   new answer will be pre-populated with data from it.
  # @return [Course::Assessment::Answer] The answer corresponding to the question. It is required
  #   that the {Course::Assessment::Answer#question} property be the same as +self+. The result
  #   should not be persisted.
  # @raise [NotImplementedError] question#attempt was not implemented.
  def attempt(submission, last_attempt = nil)
    if actable && actable.self_respond_to?(:attempt)
      return actable.attempt(submission, last_attempt ? last_attempt.actable : nil)
    end
    raise NotImplementedError, 'Questions must implement the #attempt method for submissions.'
  end

  # Test if the question is the last question of the assessment.
  #
  # @return [Boolean] True if the question is the last question, otherwise False.
  def last_question?
    assessment.questions.last == self
  end

  # Prefixes a question number in front of the title
  #
  # @return [string]
  def display_title
    question_number = I18n.t('activerecord.course/assessment/question.question_number',
                             index: assessment.questions.index(self) + 1)

    return question_number if title.blank?
    I18n.t('activerecord.course/assessment/question.question_with_title',
           question_number: question_number, title: title)
  end

  # Whether the answer has downloadable content.
  #
  # @return [Boolean]
  def downloadable?
    if actable.self_respond_to?(:downloadable?)
      actable.downloadable?
    else
      false
    end
  end

  # Copy attributes for question from the object being duplicated.
  #
  # @param other [Object] The source object to copy attributes from.
  def copy_attributes(other)
    self.title = other.title
    self.description = other.description
    self.staff_only_comments = other.staff_only_comments
    self.maximum_grade = other.maximum_grade
    self.weight = other.weight
  end

  # Associates duplicated skills with the current question
  def associate_duplicated_skills(duplicator, other)
    skills << other.skills.
              select { |skill| duplicator.duplicated?(skill) }.
              map { |skill| duplicator.duplicate(skill) }
  end

  private

  def set_defaults
    return if weight.present? || !assessment || assessment.new_record?

    # Make sure new questions appear at the end of the list.
    max_weight = assessment.questions.pluck(:weight).max
    self.weight ||= max_weight ? max_weight + 1 : 0
  end
end
