# frozen_string_literal: true
class AddVideoTabToCourseVideos < ActiveRecord::Migration[5.1]
  def change
    add_reference :course_videos,
                  :tab,
                  references: :course_video_tabs,
                  type: :integer,
                  foreign_key: { to_table: :course_video_tabs }

    ActsAsTenant.without_tenant do
      Course::Video.find_each do |video|
        video.update_column(:tab_id, video.course.default_video_tab.id)
      end
    end

    change_column_null :course_videos, :tab_id, false
  end
end
