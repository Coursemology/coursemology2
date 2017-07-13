# frozen_string_literal: true
# TODO: Refactor to Course::Assessment::Answer, and refactor Answer to Attempt
class Course::Assessment::SubmissionQuestion < ActiveRecord::Base
  acts_as_discussion_topic display_globally: true

  belongs_to :submission, class_name: Course::Assessment::Submission.name,
                          inverse_of: :submission_questions
  belongs_to :question, class_name: Course::Assessment::Question.name,
                        inverse_of: :submission_questions
  belongs_to :current_answer, class_name: Course::Assessment::Answer.name,
                              inverse_of: false

  after_initialize :set_course, if: :new_record?
  before_validation :set_course, if: :new_record?

  # Specific implementation of Course::Discussion::Topic#from_user, this is not supposed to be
  # called directly.
  scope :from_user, (lambda do |user_id|
    joining { submission }.
      where.has { submission.creator_id.in(user_id) }.
      joining { discussion_topic }.selecting { discussion_topic.id }
  end)

  def notify(post)
    Course::Assessment::SubmissionQuestion::CommentNotifier.post_replied(post.creator, post)
  end

  private

  # Set the course as the same course of the assessment.
  # This is needed because it acts as a discussion topic.
  def set_course
    self.course ||= submission.assessment.course if submission && submission.assessment
  end
end
