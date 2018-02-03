# frozen_string_literal: true
class AddRecordedVideosToVirtualClassrooms < ActiveRecord::Migration[4.2]
  def change
    add_column :course_virtual_classrooms, :recorded_videos, :jsonb
  end
end
