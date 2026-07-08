class AddTestSpreadsheetsToTextResponseSolutions < ActiveRecord::Migration[7.2]
  def change
    create_table :course_assessment_question_text_response_solution_spreadsheets do |t|
      t.references :solution, null: false, foreign_key: {
        to_table: :course_assessment_question_text_response_solutions
      }
      t.boolean :is_randomization_enabled, null: false, default: false
      t.boolean :is_random_seed_fixed, null: false, default: false
      t.integer :test_random_seed, null: true
      t.boolean :is_timestamp_fixed, null: false, default: false
      t.datetime :test_timestamp, null: true
      t.integer :num_random_tests, null: false, default: 2
      t.jsonb :variables, null: false, default: []
    end
  end
end
