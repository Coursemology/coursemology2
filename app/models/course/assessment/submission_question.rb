# frozen_string_literal: true
# TODO: Refactor to Course::Assessment::Answer, and refactor Answer to Attempt
class Course::Assessment::SubmissionQuestion < ApplicationRecord
  acts_as_discussion_topic display_globally: true

  belongs_to :submission, class_name: Course::Assessment::Submission.name,
                          inverse_of: :submission_questions
  belongs_to :question, class_name: Course::Assessment::Question.name,
                        inverse_of: :submission_questions

  after_initialize :set_course, if: :new_record?
  before_validation :set_course, if: :new_record?

  # Specific implementation of Course::Discussion::Topic#from_user, this is not supposed to be
  # called directly.
  scope :from_user, (lambda do |user_id|
    joining { submission }.
      where.has { submission.creator_id.in(user_id) }.
      joining { discussion_topic }.selecting { discussion_topic.id }
  end)

  # Gets the SubmissionQuestion of a specific submission
  scope :from_submission, (lambda do |submission_id|
    find_by(submission_id: submission_id)
  end)

  def notify(post)
    Course::Assessment::SubmissionQuestion::CommentNotifier.post_replied(post.creator, post)
  end

  def answers
    Course::Assessment::Answer.where('submission_id = ? AND question_id = ?',
                                     self.submission_id, self.question_id)
  end

  # Loads the past answers of a specific question
  def past_answers(answers_to_load)
    answers.unscope(:order).order(created_at: :desc).non_current_answers.first(answers_to_load)
  end

  private

  # Set the course as the same course of the assessment.
  # This is needed because it acts as a discussion topic.
  def set_course
    self.course ||= submission.assessment.course if submission&.assessment
  end
end
