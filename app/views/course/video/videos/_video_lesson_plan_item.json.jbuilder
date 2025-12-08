# frozen_string_literal: true
json.partial! 'course/lesson_plan/items/item', item: item

json.item_path course_video_path(current_course, item)
json.description format_ckeditor_rich_text(item.description)
type = current_component_host[:course_videos_component]&.settings&.title || :course_videos_component
json.lesson_plan_item_type [type]
