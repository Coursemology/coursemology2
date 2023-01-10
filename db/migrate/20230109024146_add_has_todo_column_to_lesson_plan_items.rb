class AddHasTodoColumnToLessonPlanItems < ActiveRecord::Migration[6.0]
  def up
    add_column :course_lesson_plan_items, :has_todo, :boolean, default: nil

    actable_types = ['Course::Assessment', 'Course::Survey', 'Course::Video']

    ActiveRecord::Base.transaction do
      Course::LessonPlan::Item.where(actable_type: actable_types).update_all(has_todo: true)
    end
  end

  def down
    remove_column :course_lesson_plan_items, :has_todo
  end
end
