# frozen_string_literal: true
class AddStickyToCourseAnnouncements < ActiveRecord::Migration[4.2]
  def change
    add_column :course_announcements, :sticky, :boolean, default: false, null: false
  end
end
