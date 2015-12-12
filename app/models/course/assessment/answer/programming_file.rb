class Course::Assessment::Answer::ProgrammingFile < ActiveRecord::Base
  schema_validations except: [:content]

  before_validation :normalize_filename

  validates :content, exclusion: [nil]

  belongs_to :answer, class_name: Course::Assessment::Answer::Programming.name, inverse_of: :files

  private

  # Normalises the filename for use across platforms.
  def normalize_filename
    self.filename = Pathname.normalize_path(filename)
  end
end
