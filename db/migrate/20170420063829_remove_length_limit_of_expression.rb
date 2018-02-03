class RemoveLengthLimitOfExpression < ActiveRecord::Migration[4.2]
  def change
    change_column :course_assessment_question_programming_test_cases, :expression, :text
  end
end
