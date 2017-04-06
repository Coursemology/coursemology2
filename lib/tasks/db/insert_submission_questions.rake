namespace :db do
  task insert_submission_questions: :environment do
    ActsAsTenant.without_tenant do
      SLICE_SIZE = 5_000
      connection = ActiveRecord::Base.connection

      # Each row contains course id, submission id, and question id
      # for all submission/question pairs.
      submission_question_tuples = connection.exec_query(<<-SQL)
        SELECT cac.course_id AS course_id, cas.id AS submission_id, caq.id AS question_id
        FROM course_assessment_submissions cas
        INNER JOIN course_assessments ca
          ON ca.id = cas.assessment_id
        INNER JOIN course_assessment_questions caq
          ON caq.assessment_id = ca.id
        INNER JOIN course_assessment_tabs cat
          ON cat.id = ca.tab_id
        INNER JOIN course_assessment_categories cac
          ON cac.id = cat.category_id
      SQL

      # DROP unique index, allowing duplicates to be inserted.
      connection.exec_query(<<-SQL)
        DROP INDEX idx_course_assessment_submission_questions_on_sub_and_qn
      SQL

      # This will insert duplicate submission_id, question_id pairs.
      # Duplicates will be removed in a later query.
      submission_question_tuples.each_slice(SLICE_SIZE) do |sq_tuples|
        submission_ids = sq_tuples.map { |x| x['submission_id'] }
        question_ids = sq_tuples.map { |x| x['question_id'] }
        now_strings = ['NOW()'] * SLICE_SIZE
        combined_arr = submission_ids.zip(question_ids, now_strings, now_strings)
        sub_qn_values = combined_arr.map { |x| '(' + x.join(',') + ')' }.join(',')

        connection.exec_query(<<-SQL)
          INSERT INTO course_assessment_submission_questions
                        (submission_id,
                         question_id,
                         created_at,
                         updated_at)
          VALUES #{sub_qn_values}
        SQL
      end

      # Clear the duplicates
      # http://stackoverflow.com/questions/6583916/delete-completely-duplicate-rows-in-postgresql-and-keep-only-1
      # This deletes the later version of the row.
      connection.exec_query(<<-SQL)
        DELETE FROM course_assessment_submission_questions a
        USING (SELECT MIN(ctid) AS ctid, submission_id, question_id
                FROM course_assessment_submission_questions GROUP BY (submission_id, question_id)
                HAVING COUNT(*)>1) b
        WHERE a.submission_id = b.submission_id AND a.question_id = b.question_id
          AND a.ctid <> b.ctid
      SQL

      # Replace the index
      connection.exec_query(<<-SQL)
        CREATE UNIQUE INDEX idx_course_assessment_submission_questions_on_sub_and_qn
        ON course_assessment_submission_questions USING btree
        (submission_id, question_id)
      SQL
    end
  end
end
