# frozen_string_literal: true
class CreateCourseGroups < ActiveRecord::Migration[4.2]
  def change
    create_table :course_groups do |t|
      t.belongs_to :course, null: false
      t.string :name, null: false, default: ''

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false

      t.index [:course_id, :name], unique: true
    end
  end
end
