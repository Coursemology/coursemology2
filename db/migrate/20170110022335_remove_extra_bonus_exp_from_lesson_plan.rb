class RemoveExtraBonusExpFromLessonPlan < ActiveRecord::Migration[4.2]
  def change
    remove_column :course_lesson_plan_items, :extra_bonus_exp, :integer
  end
end
