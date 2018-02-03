# frozen_string_literal: true
class CreateCourseUsers < ActiveRecord::Migration[4.2]
  def change
    create_table :course_users do |t|
      t.references :course, null: false
      t.references :user, null: false
      t.integer :role, default: 0, null: false
      t.string :name, null: false
      t.boolean :phantom, default: false, null: false
      t.datetime :last_active_time

      t.timestamps

      t.index [:course_id, :user_id], unique: true
    end
  end
end
