# frozen_string_literal: true
class CreateCourseAchievements < ActiveRecord::Migration[4.2]
  def change
    create_table :course_achievements do |t|
      t.references :course, null: false
      t.string :title, null: false
      t.text :description
      t.integer :weight, null: false
      t.boolean :published, null: false
      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end
  end
end
