namespace :db do
  task insert_submission_questions: :environment do
    ActsAsTenant.without_tenant do
      bulk_insert_submission_questions(10000)
    end
  end
end

# Each row contains course id, submission id, and question id
# for all submission/question pairs.
def get_course_submission_questions_id_numbers
  ActiveRecord::Base.connection.exec_query(<<-SQL)
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
end

# This is NOT idempotent. Duplicate submission_id/question_id pairs will cause errors.
def bulk_insert_submission_questions(slice_size = 10)
  connection = ActiveRecord::Base.connection
	submission_question_tuples = get_course_submission_questions_id_numbers

	submission_question_tuples.each_slice(slice_size) do |sq_tuples|
		submission_ids = sq_tuples.map { |x| x['submission_id'] }
		question_ids = sq_tuples.map { |x| x['question_id'] }
		now_strings = ['NOW()'] * slice_size
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
end
