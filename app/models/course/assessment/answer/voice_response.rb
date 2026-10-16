# frozen_string_literal: true
class Course::Assessment::Answer::VoiceResponse < ApplicationRecord
  acts_as :answer, class_name: 'Course::Assessment::Answer'
  has_one_attachment

  # About 15 minutes of recording at the ~128 kbps browsers typically default to. The client's
  # MAX_VOICE_RESPONSE_FILE_SIZE (15,000,000 bytes) is slightly stricter, so the client's checks catch an
  # oversized file first; this is the backstop.
  MAX_FILE_SIZE = 15.megabytes

  # Only an explicit upload is checked here. A new attachment reference alone doesn't mean one: copying an
  # answer (Question::VoiceResponse#attempt, e.g. on unsubmission) duplicates the reference, and must
  # succeed even for a recording saved before the limit existed. Such a recording is instead refused when
  # the student submits (see Submission::UpdateService), until it is replaced.
  validate :validate_uploaded_file_size, if: -> { @oversized_upload_size }

  def assign_params(params)
    acting_as.assign_params(params)
    self.file = params[:file] if params[:file]
  end

  # Refuses an upload over MAX_FILE_SIZE before it can replace the saved recording: assigning a file
  # replaces the attachment reference straight away (HasOneAttachment#build_attachment_reference), and a
  # failed save wouldn't bring the old one back. The size is that of the upload itself, so a file whose
  # content matches an existing attachment is checked like any other.
  def file=(file)
    if file && file.size > MAX_FILE_SIZE
      @oversized_upload_size = file.size
    else
      @oversized_upload_size = nil
      super
    end
  end

  # Whether the saved recording is over MAX_FILE_SIZE, which only one saved before the limit existed can be.
  def file_too_large?
    reference = attachment_reference
    reference.present? && reference.attachment.file_upload.size > MAX_FILE_SIZE
  end

  def compare_answer(other_answer)
    return false unless other_answer.is_a?(Course::Assessment::Answer::VoiceResponse)

    (attachment&.name == other_answer.attachment&.name) &&
      (attachment&.attachment_id == other_answer.attachment&.attachment_id)
  end

  private

  def validate_uploaded_file_size
    # Round up to 2 decimal places, so a student sees "15.01 MB" if the file is slightly over.
    errors.add(:attachment, :exceed_size_limit, file_size_mb: (@oversized_upload_size.to_f / 1.megabyte).ceil(2))
  end
end
