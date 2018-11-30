# frozen_string_literal: true
class CreateCourseVideoStatistics < ActiveRecord::Migration[5.2]
  def change
    create_table :course_video_statistics do |t|
      t.references :video, null: false,
                           type: :integer,
                           foreign_key: { to_table: :course_videos, on_delete: :cascade }
      t.integer :watch_freq, array: true, default: []
      t.integer :percent_watched, default: 0, null: false
      t.boolean :cached, default: false, null: false
    end

    create_table :course_video_submission_statistics do |t|
      t.references :submission, null: false,
                                type: :integer,
                                foreign_key: { to_table: :course_video_submissions, on_delete: :cascade }
      t.integer :watch_freq, array: true, default: []
      t.integer :percent_watched, default: 0, null: false
    end
  end
end
