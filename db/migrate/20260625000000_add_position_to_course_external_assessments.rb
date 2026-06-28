# frozen_string_literal: true
class AddPositionToCourseExternalAssessments < ActiveRecord::Migration[7.2]
  def up
    add_column :course_external_assessments, :position, :integer

    # Backfill existing rows deterministically: per course, 0-based by id.
    execute <<~SQL.squish
      UPDATE course_external_assessments AS e
      SET position = sub.rn - 1
      FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY id) AS rn
        FROM course_external_assessments
      ) AS sub
      WHERE e.id = sub.id
    SQL

    change_column_null :course_external_assessments, :position, false
  end

  def down
    remove_column :course_external_assessments, :position
  end
end
