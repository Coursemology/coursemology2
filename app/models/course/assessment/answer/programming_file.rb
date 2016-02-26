# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingFile < ActiveRecord::Base
  schema_validations except: [:content]

  before_validation :normalize_filename

  validates :content, exclusion: [nil]

  belongs_to :answer, class_name: Course::Assessment::Answer::Programming.name, inverse_of: :files
  has_many :annotations, class_name: Course::Assessment::Answer::ProgrammingFileAnnotation.name,
                         dependent: :destroy, foreign_key: :file_id, inverse_of: :file

  private

  # Normalises the filename for use across platforms.
  def normalize_filename
    self.filename = Pathname.normalize_path(filename)
  end
end
