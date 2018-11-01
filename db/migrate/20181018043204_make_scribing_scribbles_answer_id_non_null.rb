class MakeScribingScribblesAnswerIdNonNull < ActiveRecord::Migration[5.1]
  def change
    change_column_null :course_assessment_answer_scribing_scribbles, :answer_id, false
  end
end
