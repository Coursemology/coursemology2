# frozen_string_literal: true
class CreateCourseVideoEvents < ActiveRecord::Migration[5.1]
  def change
    create_table :course_video_events do |t|
      t.references :session, null: false,
                             type: :integer,
                             foreign_key: { to_table: :course_video_sessions }

      t.integer :event_type, null: false
      t.integer :sequence_num, null: false

      t.integer :video_time_initial, null: false
      t.integer :video_time_final

      t.datetime :event_time, null: false

      t.timestamps
    end

    add_index :course_video_events, [:session_id, :sequence_num], unique: true
  end
end
