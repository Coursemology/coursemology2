class RemoveOpeningReminderToken < ActiveRecord::Migration[5.1]
  def change
    remove_column :course_lesson_plan_items, :opening_reminder_token, :float
  end
end
