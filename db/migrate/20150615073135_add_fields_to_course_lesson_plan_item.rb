# frozen_string_literal: true
class AddFieldsToCourseLessonPlanItem < ActiveRecord::Migration[4.2]
  def change
    add_column :course_lesson_plan_items,
               :course_id, :integer,
               null: false,
               foreign_key: { references: :courses }
    add_column :course_lesson_plan_items, :title, :string, null: false
    add_column :course_lesson_plan_items, :description, :text
    add_column :course_lesson_plan_items, :published, :boolean, default: false, null: false
    change_column :course_lesson_plan_items, :start_time, :datetime, null: false
  end
end
