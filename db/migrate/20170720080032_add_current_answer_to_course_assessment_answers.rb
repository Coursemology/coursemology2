class AddCurrentAnswerToCourseAssessmentAnswers < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessment_answers, :current_answer, :boolean, null: false, default: false

    reversible do |dir|
      dir.up { set_current_answers }
      dir.down {}
    end
  end

  # Take the latest created_at answer as the current_answer.
  def set_current_answers
    execute <<-SQL
      WITH current_answers AS (
        WITH max_created_table AS (
          SELECT MAX(created_at) AS max_created_at, submission_id, question_id FROM course_assessment_answers
          GROUP BY submission_id, question_id
        )
        SELECT id FROM course_assessment_answers, max_created_table
          WHERE course_assessment_answers.created_at = max_created_table.max_created_at
          AND course_assessment_answers.submission_id = max_created_table.submission_id
          AND course_assessment_answers.question_id = max_created_table.question_id
      )
      UPDATE course_assessment_answers SET current_answer = true
        FROM current_answers WHERE course_assessment_answers.id = current_answers.id
    SQL
  end
end
