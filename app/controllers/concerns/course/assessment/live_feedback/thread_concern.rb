# frozen_string_literal: true
module Course::Assessment::LiveFeedback::ThreadConcern
  extend ActiveSupport::Concern

  def safe_create_and_save_thread_info
    submission_question = Course::Assessment::SubmissionQuestion.where(
      submission_id: @submission, question_id: @answer.question
    ).first

    submission_question.with_lock do
      existing_active_threads = Course::Assessment::LiveFeedback::Thread.
                                where(submission_question_id: submission_question.id, is_active: true)

      return existing_thread_status(existing_active_threads.first) unless existing_active_threads.empty?

      create_and_save_thread_if_empty(submission_question)
    end
  end

  def existing_thread_status(thread)
    thread_status = thread.is_active? ? 'active' : 'expired'

    [
      200,
      { 'thread' => { 'id' => thread.codaveri_thread_id, 'status' => thread_status } },
      thread.remaining_user_messages(current_user)
    ]
  end

  def create_and_save_thread_if_empty(submission_question)
    status, body = @answer.create_live_feedback_chat

    new_thread = save_thread_info(body['thread'], submission_question.id)

    [status, body, new_thread.max_user_messages]
  end

  def save_thread_info(thread_info, submission_question_id)
    Course::Assessment::LiveFeedback::Thread.create!({
      submission_question_id: submission_question_id,
      codaveri_thread_id: thread_info['id'],
      is_active: thread_info['status'] == 'active',
      submission_creator_id: @submission.creator_id,
      created_at: Time.zone.now
    })
  end
end
