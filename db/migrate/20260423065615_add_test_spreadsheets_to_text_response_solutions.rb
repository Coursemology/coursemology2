class AddTestSpreadsheetsToTextResponseSolutions < ActiveRecord::Migration[7.2]
  def up
    add_column :course_assessment_question_text_response_solutions,
               :is_match_case, :boolean, null: false, default: false

    # When solution_type is exact_match, set is_match_case to true to match pre-migration behavior
    ActiveRecord::Base.connection.exec_update(
      "UPDATE course_assessment_question_text_response_solutions
       SET is_match_case = TRUE
       WHERE solution_type = 0"
    )

    create_table :course_assessment_question_text_response_solution_spreadsheets do |t|
      t.references :solution, null: false, foreign_key: {
        to_table: :course_assessment_question_text_response_solutions
      }
      t.integer :attachment_size, null: false
      t.boolean :is_randomization_enabled, null: false, default: false
      t.jsonb :variables, null: false, default: {}
    end
  end

  def down
    drop_table :course_assessment_question_text_response_solution_spreadsheets
    remove_column :course_assessment_question_text_response_solutions, :is_match_case
  end
end
