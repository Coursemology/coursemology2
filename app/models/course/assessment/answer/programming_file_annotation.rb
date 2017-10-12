# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingFileAnnotation < ApplicationRecord
  acts_as_discussion_topic display_globally: true

  belongs_to :file, class_name: Course::Assessment::Answer::ProgrammingFile.name,
                    inverse_of: :annotations

  after_initialize :set_course, if: :new_record?

  # Specific implementation of Course::Discussion::Topic#from_user, this is not supposed to be
  # called directly.
  scope :from_user, (lambda do |user_id|
    joining { file.answer.answer.submission }.
      where.has { file.answer.answer.submission.creator_id.in(user_id) }.
      joining { discussion_topic }.selecting { discussion_topic.id }
  end)

  def notify(post)
    Course::Assessment::Answer::CommentNotifier.annotation_replied(post.creator, post)
  end

  private

  # Set the course as the same course of the answer.
  def set_course
    self.course ||= file.answer.question.assessment.course if file && file.answer
  end
end
