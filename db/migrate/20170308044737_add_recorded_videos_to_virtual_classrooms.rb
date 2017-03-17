# frozen_string_literal: true
class AddRecordedVideosToVirtualClassrooms < ActiveRecord::Migration
  def change
    add_column :course_virtual_classrooms, :recorded_videos, :jsonb
  end
end
