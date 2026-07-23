# frozen_string_literal: true
namespace :db do
  # Backfills a `course_assessment_submission_details` row for every base `course_assessment_submissions`
  # row that lacks one. Idempotent (`WHERE NOT EXISTS`) and batched, so it is safe to run repeatedly.
  #
  # Run this AFTER a rolling deploy has fully cut over. The create-table migration's own backfill only
  # covers rows that existed when it ran; still-old workers keep inserting detail-less base rows during
  # the deploy window, and new code reads those as previews (`Attempt#preview?` is "no detail row").
  # This task reconciles them.
  task backfill_submission_details: :environment do
    ActsAsTenant.without_tenant do
      batch_size = 5_000
      connection = ActiveRecord::Base.connection
      total = 0
      loop do
        inserted = connection.execute(<<~SQL.squish).cmd_tuples
          INSERT INTO course_assessment_submission_details
            (attempt_id, publisher_id, session_id, last_graded_time, created_at, updated_at)
          SELECT s.id, s.publisher_id, s.session_id, s.last_graded_time, s.created_at, s.updated_at
          FROM course_assessment_submissions s
          WHERE NOT EXISTS (
            SELECT 1 FROM course_assessment_submission_details d WHERE d.attempt_id = s.id
          )
          ORDER BY s.id
          LIMIT #{batch_size}
        SQL
        total += inserted
        puts "Backfilled #{total} submission detail row(s)..." if inserted > 0
        break if inserted == 0
      end
      puts "Done. Backfilled #{total} missing submission detail row(s)."
    end
  end
end
