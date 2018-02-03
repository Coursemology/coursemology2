class ChangeTestCasesExpectedType < ActiveRecord::Migration[4.2]
  def change
    change_column :course_assessment_question_programming_test_cases, :expected, :text
  end
end
