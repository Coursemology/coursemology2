# frozen_string_literal: true
class Course::Assessment::Question::TextResponse::Solution::Spreadsheet < ApplicationRecord
  belongs_to :solution, class_name: 'Course::Assessment::Question::TextResponse::Solution',
                        inverse_of: :test_spreadsheet

  has_one_attachment

  def assign_params(params)
    if params[:file]
      self.file = params[:file]
      self.attachment_size = params[:file].size
    end
    self.is_randomization_enabled = params[:is_randomization_enabled] if params.key?(:is_randomization_enabled)
    self.variables = JSON.parse(params[:variables]) if params[:variables]
  end

  def container_filename
    "sheet_#{id}#{File.extname(attachment.name)}"
  end
end
