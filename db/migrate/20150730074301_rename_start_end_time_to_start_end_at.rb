# frozen_string_literal: true
class RenameStartEndTimeToStartEndAt < ActiveRecord::Migration[4.2]
  def change
    rename_column :course_users, :last_active_time, :last_active_at

    rename_column :course_lesson_plan_items, :start_time, :start_at
    rename_column :course_lesson_plan_items, :bonus_end_time, :bonus_end_at
    rename_column :course_lesson_plan_items, :end_time, :end_at

    rename_column :course_lesson_plan_milestones, :start_time, :start_at
  end
end
