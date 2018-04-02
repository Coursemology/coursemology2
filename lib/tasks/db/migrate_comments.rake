# frozen_string_literal: true
namespace :db do
  task migrate_comments: :environment do
    ActsAsTenant.without_tenant do
      connection = ActiveRecord::Base.connection

      topic_tuples = connection.exec_query(<<-SQL)
        SELECT cdp.topic_id AS old_topic_id, cdt2.id AS new_topic_id
        FROM course_discussion_posts cdp
        INNER JOIN course_discussion_topics cdt
          ON cdp.topic_id = cdt.id AND cdt.actable_type = 'Course::Assessment::Answer'
        INNER JOIN course_assessment_answers caa
          ON caa.id = cdt.actable_id
        INNER JOIN course_assessment_submission_questions casq
          ON casq.submission_id = caa.submission_id AND casq.question_id = caa.question_id
        INNER JOIN course_discussion_topics cdt2
          ON casq.id = cdt2.actable_id
          AND cdt2.actable_type = 'Course::Assessment::SubmissionQuestion'
      SQL

      # DROP unique index on subscriptions
      connection.exec_query(<<-SQL)
        DROP INDEX index_topic_subscriptions_on_topic_id_and_user_id
      SQL

      topics_with_posts = 0
      total_posts = topic_tuples.count

      timer_loop_counter = 0
      start_time = Time.now

      topic_tuples.each do |topic|
        old_topic_id = topic['old_topic_id']
        new_topic_id = topic['new_topic_id']

        # Update the posts
        Course::Discussion::Post.where(topic_id: old_topic_id).
          update_all(topic_id: new_topic_id)

        # Update discussion topic subscriptions
        Course::Discussion::Topic::Subscription.where(topic_id: old_topic_id).
          update_all(topic_id: new_topic_id)

        # Print some time stats
        if timer_loop_counter == 1000
          end_time = Time.now
          puts "#{topics_with_posts} / #{total_posts}: #{(end_time-start_time)*1000} ms"

          start_time = Time.now
          timer_loop_counter = 0
        end

        timer_loop_counter += 1
        topics_with_posts += 1
      end

      puts "Reassigned #{topics_with_posts} topics."

      # Remove duplicates.
      # http://stackoverflow.com/questions/6583916/delete-completely-duplicate-rows-in-postgresql-and-keep-only-1
      puts "Removing duplicates in discussion topic subscriptions..."
      start_time = Time.now
      connection.exec_query(<<-SQL)
        DELETE FROM course_discussion_topic_subscriptions a
        USING (SELECT MIN(ctid) AS ctid, topic_id, user_id
                FROM course_discussion_topic_subscriptions GROUP BY topic_id, user_id
                HAVING COUNT(*) > 1) b
        WHERE a.topic_id = b.topic_id AND a.user_id = b.user_id
          AND a.ctid <> b.ctid
      SQL
      end_time = Time.now
      puts "Finished removing duplicates: #{(end_time - start_time) * 1000} milliseconds"

      # Restore unique index on subscriptions
      connection.exec_query(<<-SQL)
        CREATE UNIQUE INDEX index_topic_subscriptions_on_topic_id_and_user_id
        ON course_discussion_topic_subscriptions USING btree (topic_id, user_id)
      SQL
    end
  end
end
