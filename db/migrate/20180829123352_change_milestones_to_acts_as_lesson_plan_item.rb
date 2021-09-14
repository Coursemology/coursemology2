class ChangeMilestonesToActsAsLessonPlanItem < ActiveRecord::Migration[5.1]
  def up
    execute <<-SQL
      INSERT INTO course_lesson_plan_items (
        actable_id, actable_type, course_id, title, description, start_at, base_exp,
        time_bonus_exp, creator_id, updater_id, created_at, updated_at
      ) (
        SELECT
          id, 'Course::LessonPlan::Milestone', course_id, title, description, start_at,
          0, 0, creator_id, updater_id, created_at, updated_at
        FROM course_lesson_plan_milestones
      )
    SQL

    remove_column :course_lesson_plan_milestones, :course_id
    remove_column :course_lesson_plan_milestones, :title
    remove_column :course_lesson_plan_milestones, :description
    remove_column :course_lesson_plan_milestones, :start_at
    remove_column :course_lesson_plan_milestones, :creator_id
    remove_column :course_lesson_plan_milestones, :updater_id
    remove_column :course_lesson_plan_milestones, :created_at
    remove_column :course_lesson_plan_milestones, :updated_at
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
