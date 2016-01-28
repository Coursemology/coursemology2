# frozen_string_literal: true
class AddStickyToCourseAnnouncements < ActiveRecord::Migration
  def change
    add_column :course_announcements, :sticky, :boolean, default: false, null: false
  end
end
