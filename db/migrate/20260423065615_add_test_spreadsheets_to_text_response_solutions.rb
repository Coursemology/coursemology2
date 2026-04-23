class AddTestSpreadsheetsToTextResponseSolutions < ActiveRecord::Migration[7.2]
  def change
    create_table :course_assessment_question_text_response_solution_spreadsheets do |t|
      t.references :solution, null: false, foreign_key: { to_table: :course_assessment_question_text_response_solutions }
    end
  end
end
