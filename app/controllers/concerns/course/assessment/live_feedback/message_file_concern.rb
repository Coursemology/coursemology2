# frozen_string_literal: true
module Course::Assessment::LiveFeedback::MessageFileConcern
  extend ActiveSupport::Concern
  include Course::Assessment::LiveFeedback::FileConcern

  def associate_new_message_with_new_or_existing_files(new_message)
    file_ids = associated_file_ids_with_last_message(new_message)
    unchanged_files, modified_files = fetch_all_files_to_be_associated(file_ids)
    new_files = Course::Assessment::LiveFeedback::File.insert_all(modified_files)

    raise ActiveRecord::Rollback if !modified_files.empty? && (new_files.nil? || new_files.rows.empty?)

    associated_file_ids = unchanged_files.map(&:id) + new_files.rows.flatten
    save_message_file_association(new_message, associated_file_ids)
  end

  def associated_file_ids_with_last_message(new_message)
    last_message = @thread.messages.where.not(id: new_message.id).order(id: :desc).first

    if last_message
      Course::Assessment::LiveFeedback::MessageFile.where(message_id: last_message.id).pluck(:file_id)
    else
      []
    end
  end

  def save_message_file_association(new_message, associated_file_ids)
    new_message_files = associated_file_ids.map do |file_id|
      {
        message_id: new_message.id,
        file_id: file_id
      }
    end

    files = Course::Assessment::LiveFeedback::MessageFile.insert_all(new_message_files)
    raise ActiveRecord::Rollback if !new_message_files.empty? && (files.nil? || files.rows.empty?)
  end
end
