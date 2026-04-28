# frozen_string_literal: true
class Course::Assessment::Question::TextResponse::Solution::Spreadsheet < ApplicationRecord
  belongs_to :solution, class_name: 'Course::Assessment::Question::TextResponse::Solution',
                        inverse_of: :test_spreadsheets
  
  has_one_attachment

  def assign_params(params)
    acting_as.assign_params(params)
    self.file = params[:file] if params[:file]
  end

  def container_filename
    "sheet_#{id}#{File.extname(attachment.name)}"
  end
end
