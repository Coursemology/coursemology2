class AddCachedToCourseVideoSubmissionStatistics < ActiveRecord::Migration[5.2]
  def change
    add_column :course_video_submission_statistics, :cached, :boolean,
                default: false, null: false
  end
end
