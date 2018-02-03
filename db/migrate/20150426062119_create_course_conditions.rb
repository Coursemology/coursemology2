# frozen_string_literal: true
class CreateCourseConditions < ActiveRecord::Migration[4.2]
  def change
    create_table :course_conditions do |t|
      t.actable
      t.references :course
      t.references :conditional, polymorphic: true
      t.index [:conditional_type, :conditional_id]
      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end
  end
end
