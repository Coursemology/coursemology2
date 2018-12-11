class AddDurationToCourseVideos < ActiveRecord::Migration[5.2]
  def change
    # Add duration column to course_videos table
    add_column :course_videos, :duration, :integer, null: false, default: 0

    # Migrate video duration for existing videos:
    #
    # Old video's duration is approximated to be equal to maximum event.video_time
    # or maximum session.last_video_time, whichever higher.
    #
    # Old video duration, if wrong, will be updated with real video duration passed from
    # frontend VideoPlayer when the video is watched again.
    execute <<-SQL
      UPDATE course_videos SET duration = max_video_time
        FROM (SELECT
          video_id,
          CASE
            WHEN session_video_time > event_video_time THEN session_video_time
            ELSE event_video_time
          END
          AS max_video_time
          FROM (
            SELECT course_videos.id AS video_id,
              MAX(video_time) AS event_video_time,
              MAX(course_video_sessions.last_video_time) AS session_video_time
              FROM course_video_events
              JOIN course_video_sessions
                ON course_video_sessions.id = course_video_events.session_id
              JOIN course_video_submissions
                ON course_video_submissions.id = course_video_sessions.submission_id
              JOIN course_videos
                ON course_videos.id = course_video_submissions.video_id
              GROUP BY course_videos.id
          ) AS all_time) AS max_time
          WHERE course_videos.id = max_time.video_id
    SQL
  end
end
