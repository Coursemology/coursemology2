# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingFileAnnotation < ApplicationRecord
  acts_as_discussion_topic display_globally: true

  validates :line, numericality: { only_integer: true }, presence: true
  validates :file, presence: true

  belongs_to :file, class_name: Course::Assessment::Answer::ProgrammingFile.name,
                    inverse_of: :annotations

  after_initialize :set_course, if: :new_record?

  # Specific implementation of Course::Discussion::Topic#from_user, this is not supposed to be
  # called directly.
  scope :from_user, (lambda do |user_id|
    # joining { file.answer.answer.submission }.
    #   where.has { file.answer.answer.submission.creator_id.in(user_id) }.
    #   joining { discussion_topic }.selecting { discussion_topic.id }
    unscoped.
      joins(file: { answer: { answer: :submission } }).
      where(Course::Assessment::Submission.arel_table[:creator_id].in(user_id)).
      joins(:discussion_topic).
      select(Course::Discussion::Topic.arel_table[:id])
  end)

  def notify(post)
    Course::Assessment::Answer::CommentNotifier.annotation_replied(post)
  end

  private

  # Set the course as the same course of the answer.
  def set_course
    self.course ||= file.answer.submission.assessment.course if file&.answer
  end
end
