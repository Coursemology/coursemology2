# frozen_string_literal: true
json.array! conditional.specific_conditions do |condition|
  json.partial! 'course/condition/condition_list_data.json', condition: condition
  json.partial! "#{condition.to_partial_path}.json", condition: condition
  json.type condition.model_name.human
  json.url url_for([current_course, conditional, condition])
end
