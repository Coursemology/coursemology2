# frozen_string_literal: true
class Course::Assessment::Question::ProgrammingTemplateFile < ApplicationRecord
  include Course::Assessment::Question::ProgrammingSnapshotReadOnlyConcern

  before_validation :normalize_filename

  validates :content, exclusion: [nil]
  validates :filename, length: { maximum: 255 }, presence: true
  validates :question, presence: true
  validates :filename, uniqueness: { scope: [:question_id], case_sensitive: false,
                                     if: -> { question_id? && filename_changed? } }
  validates :question_id, uniqueness: { scope: [:filename], case_sensitive: false,
                                        if: -> { filename? && question_id_changed? } }

  belongs_to :question, class_name: 'Course::Assessment::Question::Programming',
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

  # Whether this belongs to a snapshot, or did until this change. See
  # Course::Assessment::Question::ProgrammingSnapshotReadOnlyConcern.
  def part_of_snapshot?
    return true if question&.snapshot?
    return false unless question_id_changed? && question_id_in_database

    # Not exists?: acts_as joins the parent question row to it, which a snapshot does not have.
    Course::Assessment::Question::Programming.where(id: question_id_in_database).pick(:current_id).present?
  end

  # Normalises the filename for use across platforms.
  def normalize_filename
    self.filename = Pathname.normalize_path(filename)
  end
end
