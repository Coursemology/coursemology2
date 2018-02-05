class CreateCourseVideoTables < ActiveRecord::Migration[4.2]
  def change
    create_table :course_videos do |t|
      t.string :url, null: false

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_video_submissions do |t|
      t.references :video, null: false, foreign_key: { references: :course_videos }

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    add_index :course_video_submissions, [:video_id, :creator_id], unique: true
  end
end
