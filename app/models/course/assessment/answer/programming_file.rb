# frozen_string_literal: true

class Course::Assessment::Answer::ProgrammingFile < ApplicationRecord
  before_validation :normalize_filename

  validates :content, exclusion: [nil]
  validates :filename, length: { maximum: 255 }, presence: true
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
end
