# frozen_string_literal: true
namespace :db do
  task insert_discussion_topics: :environment do
    # Insert into course_discussion_topics with
    # actable_type='Course::Assessment::SubmissionQuestion'
    #
    # Pending staff reply flag will NOT be set correctly after this.
    ActsAsTenant.without_tenant do
      SLICE_SIZE = 50
      connection = ActiveRecord::Base.connection

      # Get tuples of course_id, submission_question_id, submission_id, question_id, and the
      # maximum created and updated times of the Answer based discussion topics.
      #
      # submission_id and question_id are used to group submission_questions where there are
      # multiple answers acting as old discussion topics.
      course_sq_tuples = connection.exec_query(<<-SQL)
        SELECT cac.course_id AS course_id, casq.id AS sq_id, casq.submission_id AS submission_id,
          casq.question_id AS question_id, MAX(cdt.created_at) AS created_at,
          MAX(cdt.updated_at) AS updated_at
        FROM course_assessment_submission_questions casq
        INNER JOIN course_assessment_submissions cas
          ON cas.id = casq.submission_id
        INNER JOIN course_assessments ca
          ON ca.id = cas.assessment_id
        INNER JOIN course_assessment_tabs cat
          ON cat.id = ca.tab_id
        INNER JOIN course_assessment_categories cac
          ON cac.id = cat.category_id
        LEFT JOIN course_assessment_answers caa
          ON (caa.submission_id = casq.submission_id AND caa.question_id = casq.question_id)
        LEFT JOIN course_discussion_topics cdt
          ON (cdt.actable_id = caa.id AND cdt.actable_type = 'Course::Assessment::Answer')
        GROUP BY cac.course_id, casq.id, casq.submission_id, casq.question_id
      SQL

      puts 'DROP UNIQUE index'
      # DROP UNIQUE index
      connection.exec_query(<<-SQL)
        DROP INDEX index_course_discussion_topics_on_actable_type_and_actable_id
      SQL

      slice_index = 1
      total_slices = (course_sq_tuples.count / SLICE_SIZE.to_f).ceil

      course_sq_tuples.each_slice(SLICE_SIZE) do |csq_tuples|
        course_ids = csq_tuples.map { |x| x['course_id'] }
        sq_ids = csq_tuples.map { |x| x['sq_id'] }

        # Get created and updated times from the Answer discussion topic if available,
        # else use NOW()
        created_at = csq_tuples.map { |x| x['created_at'] }
        updated_at = csq_tuples.map { |x| x['updated_at'] }
        created_at = created_at.map { |x| x ? "'#{x}'" : 'NOW()' }
        updated_at = updated_at.map { |x| x ? "'#{x}'" : 'NOW()' }

        actable_type_strings = ["'Course::Assessment::SubmissionQuestion'"] * SLICE_SIZE
        pending_staff_reply = [false] * SLICE_SIZE
        combined_arr = sq_ids.zip(actable_type_strings, course_ids, pending_staff_reply, created_at,
                                  updated_at)
        discussion_topic_values = combined_arr.map { |x| '(' + x.join(',') + ')'}.join(',')

        puts "Start INSERT of #{combined_arr.count} rows: Slice #{slice_index} of #{total_slices}"
        start_time = Time.now
        connection.exec_query(<<-SQL)
          INSERT INTO course_discussion_topics
                        (actable_id,
                         actable_type,
                         course_id,
                         pending_staff_reply,
                         created_at,
                         updated_at)
          VALUES #{discussion_topic_values}
        SQL
        end_time = Time.now
        puts "End INSERT: #{(end_time - start_time) * 1000} milliseconds"
        slice_index += 1
      end

      puts 'Removing duplicates...'
      # Remove duplicates
      # http://stackoverflow.com/questions/6583916/delete-completely-duplicate-rows-in-postgresql-and-keep-only-1
      start_time = Time.now
      connection.exec_query(<<-SQL)
        DELETE FROM course_discussion_topics a
        USING (SELECT MIN(ctid) AS ctid, actable_type, actable_id
                FROM course_discussion_topics GROUP BY actable_type, actable_id
                HAVING COUNT(*) > 1) b
        WHERE a.actable_type = b.actable_type AND a.actable_id = b.actable_id
          AND a.ctid <> b.ctid
      SQL
      end_time = Time.now
      puts "Finished removing duplicates: #{(end_time - start_time) * 1000} milliseconds"
      
      puts 'Restoring unique index'
      # Add back unique index
      connection.exec_query(<<-SQL)
        CREATE UNIQUE INDEX index_course_discussion_topics_on_actable_type_and_actable_id
        ON course_discussion_topics USING btree (actable_type, actable_id)
      SQL
    end
  end
end

