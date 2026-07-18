# frozen_string_literal: true
class Course::Assessment::Question::TextResponseSolutionSpreadsheet < ApplicationRecord
  belongs_to :solution, class_name: 'Course::Assessment::Question::TextResponseSolution',
                        inverse_of: :test_spreadsheet

  has_one_attachment

  validates :attachment_reference, presence: true

  def assign_params(params)
    assign_attributes(
      params.slice(:is_randomization_enabled, :num_random_tests, :is_random_seed_fixed,
                   :test_random_seed, :is_timestamp_fixed, :test_timestamp, :target_sheet_name)
    )
    self.variables = JSON.parse(params[:variables]) if params[:variables]
    self.file = params[:file] if params[:file]
  end

  def initialize_duplicate(duplicator, other)
    assign_attributes(other.attributes.slice('is_randomization_enabled', 'is_random_seed_fixed',
                                             'test_random_seed', 'is_timestamp_fixed',
                                             'test_timestamp', 'num_random_tests', 'variables',
                                             'target_sheet_name'))
    self.attachment = duplicator.duplicate(other.attachment)
  end

  def container_filename
    ext = attachment&.name ? File.extname(attachment.name) : ''
    "sheet_#{id}#{ext}"
  end
end
