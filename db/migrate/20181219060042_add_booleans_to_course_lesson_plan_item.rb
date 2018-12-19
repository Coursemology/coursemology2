class AddBooleansToCourseLessonPlanItem < ActiveRecord::Migration[5.2]
  def change
    add_column :course_lesson_plan_items, :has_personal_times, :boolean, default: false, null: false
    add_column :course_lesson_plan_items, :affects_personal_times, :boolean, default: false, null: false
  end
end
