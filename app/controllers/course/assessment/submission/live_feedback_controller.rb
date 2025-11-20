# frozen_string_literal: true

class Course::Assessment::Submission::LiveFeedbackController <
  Course::Assessment::Submission::Controller
  def save_live_feedback
    current_thread_id, content, is_error = params[:current_thread_id], params[:content], params[:is_error]

    @thread = Course::Assessment::LiveFeedback::Thread.find_by(codaveri_thread_id: current_thread_id)
    return head :bad_request if @thread.nil?

    @thread.class.transaction do
      @new_message = save_new_feedback(content, is_error)

      associate_new_message_with_existing_files
    end
  end

  private

  def save_new_feedback(content, is_error)
    new_message = Course::Assessment::LiveFeedback::Message.create({
      thread_id: @thread.id,
      is_error: is_error,
      content: content,
      creator_id: 0,
      created_at: Time.zone.now,
      option_id: nil
    })

    raise ActiveRecord::Rollback unless new_message.persisted?

    new_message
  end

  def associate_new_message_with_existing_files
    last_message = @thread.messages.where.not(id: @new_message.id).max_by(&:id)
    return [] if last_message.nil?

    file_ids = Course::Assessment::LiveFeedback::MessageFile.where(message_id: last_message.id).pluck(:file_id)

    new_message_files = file_ids.map do |file_id|
      {
        message_id: @new_message.id,
        file_id: file_id
      }
    end

    files = Course::Assessment::LiveFeedback::MessageFile.insert_all(new_message_files)
    raise ActiveRecord::Rollback if !new_message_files.empty? && (files.nil? || files.rows.empty?)
  end
end
