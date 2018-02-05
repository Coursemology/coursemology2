# frozen_string_literal: true
class CreateCourseGroupUsers < ActiveRecord::Migration[4.2]
  def change
    create_table :course_group_users do |t|
      t.belongs_to :course_group, null: false
      t.belongs_to :user, null: false
      t.integer :role, null: false

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false

      t.index [:user_id, :course_group_id], unique: true
    end
  end
end
