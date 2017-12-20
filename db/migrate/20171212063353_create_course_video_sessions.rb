# frozen_string_literal: true
class CreateCourseVideoSessions < ActiveRecord::Migration[5.1]
  def change
    create_table :course_video_sessions do |t|
      t.references :submission, null: false,
                                type: :integer,
                                foreign_key: { to_table: :course_video_submissions }

      t.timestamp :session_start, null: false
      t.timestamp :session_end, null: false

      t.timestamps null: false
    end

    add_reference :course_video_sessions,
                  :creator,
                  references: :users,
                  type: :integer,
                  foreign_key: { to_table: :users }
    add_reference :course_video_sessions,
                  :updater,
                  references: :users,
                  type: :integer,
                  foreign_key: { to_table: :users }
  end
end
