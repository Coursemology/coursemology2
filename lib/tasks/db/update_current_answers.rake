namespace :db do
  task update_current_answers: :environment do
    # Set the newly added current_answer ID in the course_assessment_submission_questions table.
    #
    # SQL statement adapted from
    # https://stackoverflow.com/questions/7019831/bulk-batch-update-upsert-in-postgresql
    ActsAsTenant.without_tenant do
      connection = ActiveRecord::Base.connection

      # Set current_answer column to the last answer (assumed to be the largest ID)
      # for each submission_question.
      connection.exec_query(<<-SQL)
				UPDATE course_assessment_submission_questions SET current_answer_id = tmp_table.max_id
        FROM (SELECT MAX(id) AS max_id, submission_id, question_id
              FROM course_assessment_answers
              GROUP BY submission_id, question_id) AS tmp_table
        WHERE course_assessment_submission_questions.submission_id = tmp_table.submission_id
              AND course_assessment_submission_questions.question_id = tmp_table.question_id
      SQL
    end
  end
end
