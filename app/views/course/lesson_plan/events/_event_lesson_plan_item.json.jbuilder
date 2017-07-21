json.partial! 'course/lesson_plan/items/item.json.jbuilder', item: item

json.(item, :description, :location)
json.delete_path course_lesson_plan_event_path(current_course, item) if can?(:destroy, item)
json.edit_path edit_course_lesson_plan_event_path(current_course, item) if can?(:update, item)
json.lesson_plan_item_type [item.event_type]
