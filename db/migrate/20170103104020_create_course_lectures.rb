# frozen_string_literal: true
class CreateCourseLectures < ActiveRecord::Migration
  def change
    create_table :course_lectures do |t|
      t.references :course, null: false
      t.text :instructor_classroom_link
      t.integer :classroom_id, foreign_key: false
      t.string :title, null: false
      t.text :content
      t.time_bounded null: false

      t.userstamps null: false, foreign_key: { references: :users }

      t.timestamps null: false
    end
  end
end
