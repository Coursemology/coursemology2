# frozen_string_literal: true
class AddSubmissionGradingStatistics < ActiveRecord::Migration[4.2]
  def up
    change_table :course_assessment_answers do |t|
      t.datetime :submitted_at
      t.references :grader, references: :users
      t.datetime :graded_at
    end

    root_user_id = exec_query('SELECT * FROM users').first['id']
    exec_query('SELECT * FROM course_assessment_answers').each do |row|
      if ['submitted', 'graded'].include?(row['workflow_state'])
        execute(<<-SQL)
          UPDATE course_assessment_answers
          SET submitted_at=NOW(), grade=0
          WHERE id=#{row['id']}
        SQL
      end

      next unless row['workflow_state'] == 'graded'
      execute(<<-SQL)
        UPDATE course_assessment_answers
        SET graded_at=NOW(), grader_id=#{root_user_id}
        WHERE id=#{row['id']}
      SQL
    end
  end

  def down
    remove_columns :course_assessment_answers, :submitted_at, :grader_id, :graded_at
  end
end
