# frozen_string_literal: true
class CreateCourseVideoTopics < ActiveRecord::Migration
  def change
    create_table :course_video_topics do |t|
      t.references :video, null: false, foreign_key: { references: :course_videos }
      t.integer :timestamp, null: false
    end
  end
end
