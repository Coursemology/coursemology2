# frozen_string_literal: true

class Course::Assessment::Answer::ProgrammingFile < ApplicationRecord
  before_validation :normalize_filename

  # Not `validates :content`: an each-validator calls `blank?` on the content, which raises for bytes
  # that aren't valid UTF-8 instead of letting the content be refused.
  validate :validate_content
  validates :filename, length: { maximum: 255 }, presence: true
  validate :validate_filename_path, if: :filename_changed?
  validates :answer, presence: true
  validates :filename, uniqueness: { scope: [:answer_id],
                                     case_sensitive: false, if: -> { answer_id? && filename_changed? } }
  validates :answer_id, uniqueness: { scope: [:filename],
                                      case_sensitive: false, if: -> { filename? && answer_id_changed? } }

  belongs_to :answer, class_name: 'Course::Assessment::Answer::Programming', inverse_of: :files
  has_many :annotations, class_name: 'Course::Assessment::Answer::ProgrammingFileAnnotation',
                         dependent: :destroy, foreign_key: :file_id, inverse_of: :file

  # Separate the lines by `\r` `\n` or `\r\n`
  LINE_SEPARATOR = /\r\n|\r|\n/

  # Returns the code at lines.
  #
  # @param [Integer|Range] line_numbers zero based line numbers, can be a Integer or Range.
  # @return [Array<String>] the code lines. all lines will be returned if the `line_numbers` is not
  #   specified.
  def lines(line_numbers = nil)
    lines = content.split(LINE_SEPARATOR)

    case line_numbers
    when Range
      line_begin = [line_numbers.min, 0].max
      lines[line_begin..line_numbers.max]
    when Integer
      lines[line_numbers]
    else
      lines
    end
  end

  private

  # Normalises the filename for use across platforms.
  def normalize_filename
    self.filename = Pathname.normalize_path(filename)
  end

  # Runs after normalisation, so it mostly catches what normalisation can't fix: a path that is too
  # long, or one whose +..+ became an empty segment.
  def validate_filename_path
    errors.add(:filename, :invalid) if Course::Assessment::ProgrammingFilePath.error(filename)
  end

  # Content can be empty but not nil. When it changes it must be UTF-8 text: PostgreSQL rejects invalid
  # UTF-8 and NUL bytes in text, and almost every binary file, such as a zip, is one or the other.
  # Saving such content would raise instead of failing validation.
  def validate_content
    if content.nil?
      errors.add(:content, :exclusion, value: nil)
    elsif content_changed? && (!content.valid_encoding? || content.include?("\u0000"))
      errors.add(:content, :binary)
    end
  end
end
