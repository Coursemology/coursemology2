# frozen_string_literal: true
class CreateCourseLessonPlanItems < ActiveRecord::Migration[4.2]
  def change
    create_table :course_lesson_plan_items do |t|
      t.actable index: :unique

      t.integer :base_exp, null: false
      t.integer :time_bonus_exp, null: false
      t.integer :extra_bonus_exp, null: false
      t.timestamp :start_time
      t.timestamp :bonus_end_time
      t.timestamp :end_time
      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end
  end
end
