# frozen_string_literal: true
class Course::Assessment::Answer::VoiceResponse < ApplicationRecord
  acts_as :answer, class_name: 'Course::Assessment::Answer'
  has_one_attachment

  # About 15 minutes of recording at the ~128 kbps browsers typically default to. The client's
  # MAX_VOICE_RESPONSE_FILE_SIZE (15,000,000 bytes) is slightly stricter, so the client's checks catch an
  # oversized file first; this is the backstop.
  MAX_FILE_SIZE = 15.megabytes

  # Only a newly assigned file is checked, so answers saved before the limit existed, which can be far
  # larger, can still be saved and finalised.
  validate :validate_file_size, if: -> { attachment_reference&.new_record? }

  def assign_params(params)
    acting_as.assign_params(params)
    self.file = params[:file] if params[:file]
  end

  def compare_answer(other_answer)
    return false unless other_answer.is_a?(Course::Assessment::Answer::VoiceResponse)

    (attachment&.name == other_answer.attachment&.name) &&
      (attachment&.attachment_id == other_answer.attachment&.attachment_id)
  end

  private

  def validate_file_size
    file_size = attachment_reference.attachment.file_upload.size
    return if file_size <= MAX_FILE_SIZE

    # Round up to 2 decimal places, so a student sees "15.01 MB" if the file is slightly over.
    errors.add(:attachment, :exceed_size_limit, file_size_mb: (file_size.to_f / 1.megabyte).ceil(2))
  end
end
