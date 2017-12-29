# frozen_string_literal: true
class AddPlayBackRateAndSessionVideoTime < ActiveRecord::Migration[5.1]
  def change
    add_column :course_video_events, :playback_rate, :float
    add_column :course_video_sessions, :last_video_time, :integer
    remove_column :course_video_events, :video_time_final
    rename_column :course_video_events, :video_time_initial, :video_time
  end
end
