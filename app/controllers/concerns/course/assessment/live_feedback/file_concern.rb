# frozen_string_literal: true
module Course::Assessment::LiveFeedback::FileConcern
  extend ActiveSupport::Concern

  def snapshot_files_hash(file_ids)
    Course::Assessment::LiveFeedback::File.where(id: file_ids).to_h do |file|
      [file.filename, file]
    end
  end

  def answer_files_hash
    @answer.actable.files.to_h do |file|
      [file.filename, file]
    end
  end

  def fetch_all_unchanged_files(file_hash, current_answer_file_hash)
    file_hash.each_with_object([]) do |(filename, file), unchanged|
      if current_answer_file_hash[filename] && current_answer_file_hash[filename].content == file.content
        unchanged << file
      end
    end
  end

  def fetch_all_modified_files(file_hash, current_answer_file_hash)
    current_answer_file_hash.each_with_object([]) do |(filename, file), modified|
      if !file_hash[filename] || file_hash[filename].content != file.content
        modified << { filename: file.filename,
                      content: file.content }
      end
    end
  end

  def fetch_all_files_to_be_associated(file_ids)
    file_hash = snapshot_files_hash(file_ids)
    current_answer_file_hash = answer_files_hash

    unchanged_files = fetch_all_unchanged_files(file_hash, current_answer_file_hash)
    modified_files = fetch_all_modified_files(file_hash, current_answer_file_hash)

    [unchanged_files, modified_files]
  end
end
