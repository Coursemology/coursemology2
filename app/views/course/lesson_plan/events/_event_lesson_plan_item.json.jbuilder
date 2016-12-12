json.partial! 'course/lesson_plan/items/item.json.jbuilder', item: item

json.description item.description
json.location item.location
json.end_at item.end_at
json.delete_path course_lesson_plan_event_path(current_course, item) if can?(:destroy, item)
json.edit_path edit_course_lesson_plan_event_path(current_course, item) if can?(:update, item)
json.lesson_plan_item_type [Course::LessonPlan::Event.human_attribute_name(item.event_type)]
