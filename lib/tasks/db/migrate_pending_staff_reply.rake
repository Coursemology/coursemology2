# frozen_string_literal: true
namespace :db do
  # Run this after migrating posts to the new SubmissionQuestion topics.
  task migrate_pending_staff_reply: :environment do
    ActsAsTenant.without_tenant do
      # Get Answer based topic IDs with pending_staff_reply flag set.
      old_topic_ids = ActiveRecord::Base.connection.exec_query(<<-SQL)
        SELECT actable_id FROM course_discussion_topics
        WHERE actable_type='Course::Assessment::Answer'
          AND pending_staff_reply=true
      SQL

      old_topic_ids = old_topic_ids.map { |x| x['actable_id'] }

      old_topic_ids.each do |old_topic_id|
        answer = Course::Assessment::Answer.find(old_topic_id)
        new_topic = Course::Assessment::SubmissionQuestion.
                      find_by(submission: answer.submission, question: answer.question).acting_as
        new_topic.pending_staff_reply = true
        new_topic.save!
      end
    end
  end
end
