# frozen_string_literal: true
json.partial! 'course/lesson_plan/items/item.json.jbuilder', item: item

json.eventId item.id
json.(item, :description, :location)
json.lesson_plan_item_type [item.event_type]
