# frozen_string_literal: true
class RenameCourseEventsToCourseLessonPlanEvents < ActiveRecord::Migration[4.2]
  def change
    rename_table :course_events, :course_lesson_plan_events
  end
end
