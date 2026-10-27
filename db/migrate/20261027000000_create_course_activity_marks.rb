# frozen_string_literal: true
#
# One row per student, course and month in which that student had at least one activity, for the system admin
# activity statistics. Storing students rather than counts lets any period or grouping be counted as unique students.
#
# Rows must outlive the user, course and instance they name, so that past statistics do not shrink when those are
# deleted. The ids therefore have no foreign keys: every ON DELETE action would instead block the deletion
# (NO ACTION, RESTRICT), delete the mark (CASCADE) or blank the id (SET NULL). The ids still join to their tables
# while the rows exist.
#
# instance_id is stored even though the course implies it, because a deleted course no longer can.
class CreateCourseActivityMarks < ActiveRecord::Migration[8.1]
  def change
    create_table :course_activity_marks, primary_key: [:course_id, :month, :user_id] do |t|
      t.integer :course_id, null: false
      t.date :month, null: false, comment: 'First day of the month, UTC'
      t.integer :user_id, null: false
      t.integer :instance_id, null: false

      # Serves the per-instance and overall monthly or yearly counts from the index alone.
      t.index [:month, :instance_id, :user_id], name: 'index_course_activity_marks_on_month_instance_user'
    end
  end
end
