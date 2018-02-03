class RemoveModeAndInvertDraft < ActiveRecord::Migration[4.2]
  def change
    remove_column :course_assessments, :mode, :integer
    rename_column :course_lesson_plan_items, :draft, :published
    execute(<<-SQL)
        UPDATE course_lesson_plan_items SET published = NOT published
    SQL

    rename_column :course_achievements, :draft, :published
    execute(<<-SQL)
        UPDATE course_achievements SET published = NOT published
    SQL
  end
end
