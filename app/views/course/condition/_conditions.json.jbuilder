# frozen_string_literal: true
json.array! conditional.specific_conditions do |condition|
  json.partial! 'course/condition/condition_list_data', condition: condition
  json.partial! condition.to_partial_path, condition: condition
  json.type condition.class.model_name.element
  json.displayName condition.class.display_name(current_course)
  json.url url_for([current_course, conditional, condition])
end
