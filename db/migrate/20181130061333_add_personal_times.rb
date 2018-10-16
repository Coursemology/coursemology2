class AddPersonalTimes < ActiveRecord::Migration[5.1]
  def change
    create_table :course_personal_times do |t|
      t.references :course_user, null: false, index: true, foreign_key: { to_table: :course_users }
      t.references :lesson_plan_item,
                   null: false, index: true, foreign_key: { to_table: :course_lesson_plan_items }
      t.datetime :start_at, null: false
      t.datetime :bonus_end_at
      t.datetime :end_at
      t.boolean :fixed, null: false, default: false
    end

    # Default everyone to 0 (fixed timeline)
    add_column :course_users, :timeline_algorithm, :integer, index: true, null: false, default: 0
  end
end
