# frozen_string_literal: true
class RenamePublishedToDraft < ActiveRecord::Migration[4.2]
  def up
    rename_column :course_achievements, :published, :draft
    rename_column :course_lesson_plan_items, :published, :draft

    execute <<-SQL
      UPDATE course_achievements SET draft = NOT draft;
      UPDATE course_lesson_plan_items SET draft = NOT draft;
    SQL
  end

  def down
    execute <<-SQL
      UPDATE course_achievements SET draft = NOT draft;
      UPDATE course_lesson_plan_items SET draft = NOT draft;
    SQL

    rename_column :course_achievements, :draft, :published
    rename_column :course_lesson_plan_items, :draft, :published
  end
end
