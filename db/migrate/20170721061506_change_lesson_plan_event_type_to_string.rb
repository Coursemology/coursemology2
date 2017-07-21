class ChangeLessonPlanEventTypeToString < ActiveRecord::Migration
  def change
    event_type_names = ['Other', 'Lecture', 'Recitation', 'Tutorial']
    rename_column :course_lesson_plan_events, :event_type, :event_type_enum
    add_column :course_lesson_plan_events, :event_type, :string
    Course::LessonPlan::Event.reset_column_information
    ActsAsTenant.without_tenant do
      Course::LessonPlan::Event.all.each do |event|
        event.update_column(:event_type, event_type_names[event.event_type_enum])
      end
    end
    change_column_null :course_lesson_plan_events, :event_type, false
    remove_column :course_lesson_plan_events, :event_type_enum
  end
end
