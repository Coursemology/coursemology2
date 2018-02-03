class AddAttemptLimitToProgrammingQuestions < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessment_question_programming, :attempt_limit, :integer
  end
end
