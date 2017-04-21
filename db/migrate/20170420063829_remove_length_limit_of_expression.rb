class RemoveLengthLimitOfExpression < ActiveRecord::Migration
  def change
    change_column :course_assessment_question_programming_test_cases, :expression, :text
  end
end
