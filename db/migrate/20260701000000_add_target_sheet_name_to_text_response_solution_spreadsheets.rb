# frozen_string_literal: true
class AddTargetSheetNameToTextResponseSolutionSpreadsheets < ActiveRecord::Migration[7.2]
  def change
    add_column :course_assessment_question_text_response_solution_spreadsheets,
               :target_sheet_name, :string
  end
end
