# frozen_string_literal: true
class CreateCourseVideoWatchIntervals < ActiveRecord::Migration[5.0]
  def change
    create_table :course_video_watch_intervals do |t|
      t.references :submission, null: false,
                                type: :integer,
                                foreign_key: { to_table: :course_video_submissions }

      t.integer :video_start, null: false
      t.integer :video_end, null: false
      t.timestamp :end_recorded_at, null: false

      t.timestamps null: false
    end

    add_reference :course_video_watch_intervals,
                  :creator,
                  references: :users,
                  type: :integer,
                  foreign_key: { to_table: :users }
    add_reference :course_video_watch_intervals,
                  :updater,
                  references: :users,
                  type: :integer,
                  foreign_key: { to_table: :users }
  end
end
