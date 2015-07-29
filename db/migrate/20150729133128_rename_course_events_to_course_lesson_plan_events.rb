class RenameCourseEventsToCourseLessonPlanEvents < ActiveRecord::Migration
  def change
    rename_table :course_events, :course_lesson_plan_events
  end
end
