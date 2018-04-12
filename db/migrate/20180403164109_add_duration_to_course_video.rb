class AddDurationToCourseVideo < ActiveRecord::Migration[5.1]
  def up
    add_column :course_videos, :duration, :integer
    Course::Video.reset_column_information

    ActsAsTenant.without_tenant do
      Course::Video.where('course_videos.duration IS NULL').find_each do |video|
        video.send(:set_duration)
        video.save!(validate: false)
      end
    end

    change_column_null :course_videos, :duration, false
  end

  def down
    remove_column :course_videos, :duration
  end
end
