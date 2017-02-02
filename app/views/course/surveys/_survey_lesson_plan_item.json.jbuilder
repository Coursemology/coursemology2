json.partial! 'course/lesson_plan/items/item.json.jbuilder', item: item
json.lesson_plan_item_type [Course::Survey.model_name.human]
json.item_path course_survey_path(current_course, item)
