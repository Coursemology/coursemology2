# frozen_string_literal: true
json.partial! 'course/lesson_plan/items/item.json.jbuilder', item: item

json.item_path course_video_path(current_course, item)
json.description format_html(item.description)
json.edit_path edit_course_video_path(current_course, item) if can?(:update, item)
json.delete_path course_video_path(current_course, item) if can?(:destroy, item)
type = current_component_host[:course_videos_component]&.settings&.title || t('components.video.name')
json.lesson_plan_item_type [type]
