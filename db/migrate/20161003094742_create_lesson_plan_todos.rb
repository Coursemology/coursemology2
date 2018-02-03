class CreateLessonPlanTodos < ActiveRecord::Migration[4.2]
  def change
    create_table :course_lesson_plan_todos do |t|
      t.references :item, null: false, references: :course_lesson_plan_items
      t.references :user, null: false
      t.string :workflow_state, null: false
      t.boolean :ignore, null: false, default: false

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps

      t.index [:item_id, :user_id], unique: true
    end
  end
end
