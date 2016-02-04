class AddExitCodeToProgrammingEvaluation < ActiveRecord::Migration
  def change
    change_table :course_assessment_programming_evaluations do |t|
      t.integer :exit_code
    end
  end
end
