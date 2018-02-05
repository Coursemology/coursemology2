# frozen_string_literal: true
class CreateCourseAnnouncements < ActiveRecord::Migration[4.2]
  def change
    create_table :course_announcements do |t|
      t.references :course, null: false
      t.string :title, null: false
      t.text :content
      t.time_bounded null: false

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end
  end
end
