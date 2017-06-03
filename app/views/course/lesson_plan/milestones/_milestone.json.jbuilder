json.(milestone, :id, :title, :description, :start_at)
json.edit_path edit_course_lesson_plan_milestone_path(current_course, milestone) if can?(:update, milestone)
json.delete_path course_lesson_plan_milestone_path(current_course, milestone) if can?(:destroy, milestone)
