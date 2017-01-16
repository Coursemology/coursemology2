class AddTokensToCourseLessonPlanItems < ActiveRecord::Migration
  def change
    add_column :course_lesson_plan_items, :opening_reminder_token, :float
    add_column :course_lesson_plan_items, :closing_reminder_token, :float
  end
end
