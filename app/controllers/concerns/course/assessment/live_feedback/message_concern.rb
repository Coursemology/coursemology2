# frozen_string_literal: true
module Course::Assessment::LiveFeedback::MessageConcern
  extend ActiveSupport::Concern
  include Course::Assessment::LiveFeedback::MessageFileConcern

  def handle_save_user_message
    @thread = Course::Assessment::LiveFeedback::Thread.where(codaveri_thread_id: @thread_id).first

    @thread.class.transaction do
      new_message = create_new_message

      new_options = @options.map do |option_id|
        {
          message_id: new_message.id,
          option_id: option_id
        }
      end

      options = Course::Assessment::LiveFeedback::MessageOption.insert_all(new_options)
      raise ActiveRecord::Rollback if !new_options.empty? && (options.nil? || options.rows.empty?)

      associate_new_message_with_new_or_existing_files(new_message)
    end
  end

  def create_new_message
    new_message = Course::Assessment::LiveFeedback::Message.create({
      thread_id: @thread.id,
      is_error: false,
      content: @message,
      creator_id: current_user.id,
      created_at: Time.zone.now,
      option_id: @option_id
    })

    raise ActiveRecord::Rollback unless new_message.persisted?

    new_message
  end
end
