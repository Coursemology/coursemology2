# frozen_string_literal: true
namespace :db do
  # Backfills course_activity_marks for one calendar month (UTC) from activities, e.g.
  #
  #   bin/rails 'db:backfill_course_activity_marks[2025-03]'
  #
  # One month per run keeps each statement short: on a production snapshot a month takes about a second. Runs can be
  # repeated or overlap with marks written elsewhere, as existing marks are kept.
  #
  # The marks are selected first and inserted separately, in batches. Postgres does not run the SELECT of an
  # INSERT ... SELECT in parallel, and these joins took about ten times as long that way.
  #
  # Activities do not record the actor's role at the time, so this counts actors who are *currently* non-phantom
  # students of the course. Activities whose object or course has since been deleted cannot be attributed and are
  # skipped.
  #
  # System administrators are never counted, and instance administrators are not counted in the instance they
  # administer, as their student activity there is usually testing. An instance administrator enrolled as a student
  # elsewhere (e.g. a school's admin on a teachers' course in another instance) still counts there.
  task :backfill_course_activity_marks, [:month] => :environment do |_, args|
    month = begin
      Date.strptime(args[:month].to_s, '%Y-%m')
    rescue Date::Error
      abort "Usage: bin/rails 'db:backfill_course_activity_marks[YYYY-MM]' (got #{args[:month].inspect})"
    end
    from = Time.utc(month.year, month.month)
    params = {
      from: from,
      to: from.next_month,
      student_role: CourseUser.roles[:student],
      system_user_id: User::SYSTEM_USER_ID
    }

    sql = ActiveRecord::Base.sanitize_sql_array([<<~SQL, params])
      SELECT DISTINCT c.id, a.actor_id, c.instance_id
      FROM activities a
      LEFT JOIN course_assessment_submissions sub
             ON a.object_type = 'Course::Assessment::Submission' AND sub.id = a.object_id
      LEFT JOIN course_assessments asm
             ON asm.id = CASE WHEN a.object_type = 'Course::Assessment' THEN a.object_id
                              ELSE sub.assessment_id END
      LEFT JOIN course_assessment_tabs tab ON tab.id = asm.tab_id
      LEFT JOIN course_assessment_categories cat ON cat.id = tab.category_id
      LEFT JOIN course_discussion_posts p
             ON a.object_type = 'Course::Discussion::Post' AND p.id = a.object_id
      LEFT JOIN course_discussion_topics dt ON dt.id = p.topic_id
      LEFT JOIN course_forum_topics ft
             ON a.object_type = 'Course::Forum::Topic' AND ft.id = a.object_id
      LEFT JOIN course_forums f ON f.id = ft.forum_id
      LEFT JOIN course_videos v
             ON a.object_type = 'Course::Video' AND v.id = a.object_id
      LEFT JOIN course_video_tabs vt ON vt.id = v.tab_id
      LEFT JOIN course_achievements ach
             ON a.object_type = 'Course::Achievement' AND ach.id = a.object_id
      LEFT JOIN course_levels lv
             ON a.object_type = 'Course::Level' AND lv.id = a.object_id
      LEFT JOIN course_announcements an
             ON a.object_type = 'Course::Announcement' AND an.id = a.object_id
      JOIN course_users cu
        ON cu.course_id = COALESCE(cat.course_id, dt.course_id, f.course_id, vt.course_id,
                                   ach.course_id, lv.course_id, an.course_id)
       AND cu.user_id = a.actor_id
       AND cu.role = :student_role
       AND cu.phantom = FALSE
      JOIN courses c ON c.id = cu.course_id
      WHERE a.created_at >= :from AND a.created_at < :to
        AND a.actor_id <> :system_user_id
    SQL

    # A few hundred ids at most, so they are loaded once and dropped from the result rather than joined in the query,
    # which keeps its plan the same.
    system_admin_ids = User.administrator.pluck(:id).to_set
    instance_admins = ActsAsTenant.without_tenant { InstanceUser.administrator.pluck(:instance_id, :user_id) }.to_set

    started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    rows = ActiveRecord::Base.connection.select_rows(sql).map { |row| row.map(&:to_i) }
    marks = rows.filter_map do |course_id, user_id, instance_id|
      next if system_admin_ids.include?(user_id) || instance_admins.include?([instance_id, user_id])

      { course_id: course_id, month: month, user_id: user_id, instance_id: instance_id }
    end
    # insert_all skips marks that already exist (ON CONFLICT DO NOTHING) and returns only the new ones.
    inserted = marks.each_slice(1000).sum { |batch| Course::ActivityMark.insert_all(batch).length }
    seconds = Process.clock_gettime(Process::CLOCK_MONOTONIC) - started

    # "Already present" equals "found" on a re-run, which confirms the run changed nothing. Once marks are written as
    # activities happen, it shows how many of these the live writes had already recorded, and the month's total can
    # exceed "found" if they recorded marks this backfill cannot derive.
    month_total = Course::ActivityMark.where(month: month).count
    skipped = rows.size - marks.size
    puts "#{month.strftime('%Y-%m')}: #{marks.size} marks found (#{skipped} administrator " \
         "#{'mark'.pluralize(skipped)} skipped), #{inserted} added, #{marks.size - inserted} already present; " \
         "#{month_total} marks stored for the month; #{seconds.round(2)}s"
  end
end
