# frozen_string_literal: true

todo_item_with_timeline = @todo_items_with_timeline_hash[todo.item.id]

# For generating ignore button path and redux store
json.id todo.id

json.itemActableId todo.item.actable.id
json.itemActableTitle todo.item.actable.title

effective_time = todo_item_with_timeline.time_for(current_course_user)

json.isPersonalTime effective_time.is_a? Course::PersonalTime

json.startTimeInfo do
  json.partial! 'course/lesson_plan/items/personal_or_ref_time',
                item: todo_item_with_timeline,
                course_user: current_course_user,
                attribute: :start_at,
                datetime_format: :long
end

json.endTimeInfo do
  json.partial! 'course/lesson_plan/items/personal_or_ref_time',
                item: todo_item_with_timeline,
                course_user: current_course_user,
                attribute: :end_at,
                datetime_format: :long
end

json.progress todo.workflow_state

actable = todo.item.actable

case actable
when Course::Assessment
  submission = @assessment_todos_hash[actable.id]
  json.itemActableSpecificId submission&.id
  json.canAccess can?(:access, actable)
  json.canAttempt can?(:attempt, actable)
when Course::Video
  json.itemActableSpecificId actable.id
when Course::Survey
  response = @survey_todos_hash[actable.id]
  json.itemActableSpecificId response&.id
end
