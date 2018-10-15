class AddReferenceTimeline < ActiveRecord::Migration[5.1]
  def up
    #### Add new tables and columns

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

    #### Data migration

    execute <<-SQL
      -- Create a reference timeline for each course
      INSERT INTO course_reference_timelines (course_id, "default", created_at, updated_at)
      SELECT id, true, NOW()::TIMESTAMP, NOW()::TIMESTAMP FROM courses;

      -- Create a reference time for each lesson plan item
      INSERT INTO course_reference_times (
        reference_timeline_id, lesson_plan_item_id, start_at, bonus_end_at, end_at, created_at, updated_at
      )
      SELECT
        course_reference_timelines.id, course_lesson_plan_items.id, start_at, bonus_end_at, end_at,
        NOW()::TIMESTAMP, NOW()::TIMESTAMP
      FROM course_lesson_plan_items
      INNER JOIN course_reference_timelines
        ON course_lesson_plan_items.course_id = course_reference_timelines.course_id;
    SQL

    #### Clean up old columns

    remove_column :course_lesson_plan_items, :start_at
    remove_column :course_lesson_plan_items, :bonus_end_at
    remove_column :course_lesson_plan_items, :end_at
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
