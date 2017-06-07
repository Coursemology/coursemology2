class CreateCourseLessonPlanEventMaterials < ActiveRecord::Migration
  def change
    create_table :course_lesson_plan_event_materials do |t|
      t.references :lesson_plan_event,
                   foreign_key: { references: :course_lesson_plan_events },
                   null: false
      t.references :material,
                   foreign_key: { references: :course_materials },
                   null: false
    end
  end
end
