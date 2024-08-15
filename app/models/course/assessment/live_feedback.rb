# frozen_string_literal: true
class Course::Assessment::LiveFeedback < ApplicationRecord
  belongs_to :assessment, class_name: 'Course::Assessment', foreign_key: 'assessment_id', inverse_of: :live_feedbacks
  belongs_to :question, class_name: 'Course::Assessment::Question', foreign_key: 'question_id',
                        inverse_of: :live_feedbacks
  belongs_to :creator, class_name: 'CourseUser', foreign_key: 'creator_course_id', inverse_of: :live_feedbacks
  has_many :code, class_name: 'Course::Assessment::LiveFeedbackCode', foreign_key: 'feedback_id',
                  inverse_of: :feedback, dependent: :destroy

  def self.create_with_codes(assessment_id, question_id, course_user_id, feedback_id, files)
    live_feedback = new(
      assessment_id: assessment_id,
      question_id: question_id,
      creator_course_id: course_user_id,
      feedback_id: feedback_id
    )

    if live_feedback.save
      files.each do |file|
        live_feedback_code = Course::Assessment::LiveFeedbackCode.new(
          feedback_id: live_feedback.id,
          filename: file.filename,
          content: file.content
        )
        unless live_feedback_code.save
          Rails.logger.error "Failed to save live_feedback_code: #{live_feedback_code.errors.full_messages.join(', ')}"
        end
      end
      live_feedback
    else
      Rails.logger.error "Failed to save live_feedback: #{live_feedback.errors.full_messages.join(', ')}"
      nil
    end
  end
end
