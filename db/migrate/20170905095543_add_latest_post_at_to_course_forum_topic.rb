class AddLatestPostAtToCourseForumTopic < ActiveRecord::Migration
  def change
    add_column :course_forum_topics, :latest_post_at, :datetime

    exec_query(<<-SQL)
      UPDATE course_forum_topics
      SET latest_post_at = created_at
    SQL

    exec_query(<<-SQL)
      UPDATE course_forum_topics AS cft
      SET latest_post_at = t2.latest_post_at
      FROM (
        SELECT cdt.actable_id AS id, t1.latest_post_at AS latest_post_at FROM (
          (
            SELECT topic_id, MAX(created_at) AS latest_post_at
            FROM course_discussion_posts
            GROUP BY topic_id
          ) AS t1
          JOIN course_discussion_topics AS cdt
          ON cdt.id = t1.topic_id
          AND cdt.actable_type = 'Course::Forum::Topic'
        )
      ) AS t2
      WHERE cft.id = t2.id
    SQL

    change_column_null :course_forum_topics, :latest_post_at, false
  end
end
