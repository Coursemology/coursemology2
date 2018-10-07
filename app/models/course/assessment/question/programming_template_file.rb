# frozen_string_literal: true
class Course::Assessment::Question::ProgrammingTemplateFile < ApplicationRecord
  before_validation :normalize_filename

  validates :content, exclusion: [nil]
  validates_length_of :filename, allow_nil: true, maximum: 255
  validates_presence_of :filename
  validates_presence_of :question
  validates_uniqueness_of :filename, scope: [:question_id], allow_nil: true, case_sensitive: false,
                                     if: -> { question_id? && filename_changed? }
  validates_uniqueness_of :question_id, scope: [:filename], allow_nil: true, case_sensitive: false,
                                        if: -> { filename? && question_id_changed? }

  belongs_to :question, class_name: Course::Assessment::Question::Programming.name,
                        inverse_of: :template_files

  # Copies the current template into the provided answer.
  #
  # This preserves the filename and contents.
  #
  # @param [Course::Assessment::Answer::Programming] answer The answer to copy the template into.
  # @return [Course::Assessment::Answer::ProgrammingFile] The copied file.
  def copy_template_to(answer)
    answer.files.build(filename: filename, content: content)
  end

  def initialize_duplicate(_duplicator, _other)
  end

  private

  # Normalises the filename for use across platforms.
  def normalize_filename
    self.filename = Pathname.normalize_path(filename)
  end
end
