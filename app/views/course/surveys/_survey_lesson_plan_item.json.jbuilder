# frozen_string_literal: true
json.partial! 'course/lesson_plan/items/item.json.jbuilder', item: item
json.lesson_plan_item_type [t('components.surveys.name')]
json.item_path course_survey_path(current_course, item)
