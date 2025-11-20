# frozen_string_literal: true
class Course::Assessment::LiveFeedback::Thread < ApplicationRecord
  self.table_name = 'live_feedback_threads'

  belongs_to :submission_question, class_name: 'Course::Assessment::SubmissionQuestion',
                                   foreign_key: 'submission_question_id', inverse_of: :threads
  has_many :messages, class_name: 'Course::Assessment::LiveFeedback::Message',
                      foreign_key: 'thread_id', inverse_of: :thread, dependent: :destroy

  validate :validate_at_most_one_active_thread_per_submission_question
  validates :codaveri_thread_id, presence: true
  validates :is_active, inclusion: { in: [true, false] }
  validates :submission_creator_id, presence: true
  validates :created_at, presence: true

  def validate_at_most_one_active_thread_per_submission_question
    return unless is_active

    active_thread_count = Course::Assessment::LiveFeedback::Thread.where(
      submission_question_id: submission_question_id, is_active: true
    ).count

    return if active_thread_count <= 1

    errors.add(:base, I18n.t('course.assessment.live_feedback.thread.only_one_active_thread'))
  end

  def sent_user_messages(user_id)
    messages.where(creator_id: user_id).count
  end
end
