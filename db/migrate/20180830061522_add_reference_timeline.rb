class AddReferenceTimeline < ActiveRecord::Migration[5.1]
  def change
    # course_lesson_plan_items
    add_column :course_lesson_plan_items, :triggers_recomputation, :boolean, null: false, default: false
    add_column :course_lesson_plan_items, :movable, :boolean, null: false, default: false

    # course_reference_timelines
    create_table :course_reference_timelines do |t|
      t.references :course, null: false, index: true, foreign_key: { to_table: :courses }
      t.boolean :default, null: false, default: false
      t.timestamps
    end

    # course_reference_times
    create_table :course_reference_times do |t|
      t.references :reference_timeline,
                   null: false, index: true, foreign_key: { to_table: :course_reference_timelines }
      t.references :lesson_plan_item,
                   null: false, index: true, foreign_key: { to_table: :course_lesson_plan_items }
      t.datetime :start_at, null: false
      t.datetime :bonus_end_at
      t.datetime :end_at
      t.timestamps
    end

    # course_users
    add_reference :course_users, :reference_timeline,
                  index: true, foreign_key: { to_table: :course_reference_timelines }
  end
end
