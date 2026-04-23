# frozen_string_literal: true
class Course::Assessment::Question::TextResponseSolutionSpreadsheet < ApplicationRecord
  belongs_to :solution, class_name: 'Course::Assessment::Question::TextResponseSolution',
                        inverse_of: :spreadsheets
  
  has_one_attachment
end
