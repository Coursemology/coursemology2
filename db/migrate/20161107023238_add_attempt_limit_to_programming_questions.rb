class AddAttemptLimitToProgrammingQuestions < ActiveRecord::Migration
  def change
    add_column :course_assessment_question_programming, :attempt_limit, :integer
  end
end
