# frozen_string_literal: true
class CreateCourseLessonPlanMilestones < ActiveRecord::Migration[4.2]
  def change
    create_table :course_lesson_plan_milestones do |t|
      t.references :course
      t.string :title, null: false
      t.text :description
      t.timestamp :start_time, null: false

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end
  end
end
