# frozen_string_literal: true
class AddExitCodeToProgrammingEvaluation < ActiveRecord::Migration[4.2]
  def change
    change_table :course_assessment_programming_evaluations do |t|
      t.integer :exit_code
    end
  end
end
