# frozen_string_literal: true
json.enabledConditions Course::Condition::ALL_CONDITIONS do |condition|
  if component_enabled?(condition[:name]) && condition[:active]
    condition_model = condition[:name].constantize
    json.type condition_model.model_name.element
    json.displayName condition_model.display_name(current_course)
    json.url url_for([current_course, conditional, condition_model])
  end
end
