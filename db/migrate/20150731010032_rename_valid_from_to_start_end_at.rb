# frozen_string_literal: true
class RenameValidFromToStartEndAt < ActiveRecord::Migration[4.2]
  def change
    rename_column :course_announcements, :valid_from, :start_at
    rename_column :course_announcements, :valid_to, :end_at
    rename_column :generic_announcements, :valid_from, :start_at
    rename_column :generic_announcements, :valid_to, :end_at
  end
end
