# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingFile < ApplicationRecord
  schema_validations except: [:content]

  before_validation :normalize_filename

  validates :content, exclusion: [nil]
  validate :validate_content_size

  belongs_to :answer, class_name: Course::Assessment::Answer::Programming.name, inverse_of: :files
  has_many :annotations, class_name: Course::Assessment::Answer::ProgrammingFileAnnotation.name,
                         dependent: :destroy, foreign_key: :file_id, inverse_of: :file

  # Separate the lines by `\r` `\n` or `\r\n`
  LINE_SEPARATOR = /\r\n|\r|\n/
  MAX_LINES = ApplicationHTMLFormattersHelper::MAX_CODE_LINES
  MAX_SIZE = ApplicationHTMLFormattersHelper::MAX_CODE_SIZE

  # Returns the code at lines.
  #
  # @param [Integer|Range] line_numbers zero based line numbers, can be a Integer or Range.
  # @return [Array<String>] the code lines. all lines will be returned if the `line_numbers` is not
  #   specified.
  def lines(line_numbers = nil)
    lines = content.split(LINE_SEPARATOR)

    case line_numbers
    when Range
      line_begin = line_numbers.min < 0 ? 0 : line_numbers.min
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

  def validate_content_size
    return unless content.present?
    return if content.bytesize <= MAX_SIZE && content.lines.size <= MAX_LINES

    errors.add(:content, :exceed_size_limit)
  end
end
