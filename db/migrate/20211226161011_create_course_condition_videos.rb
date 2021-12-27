class CreateCourseConditionVideos < ActiveRecord::Migration[6.0]
  def change
    create_table :course_condition_videos do |t|
      t.references :video, null: false, foreign_key: { to_table: :course_videos },
                           index: { name: 'fk__course_condition_videos_video_id' }
      t.float :minimum_watch_percentage
    end
  end
end
