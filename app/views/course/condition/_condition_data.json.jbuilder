# frozen_string_literal: true

json.enabledConditions Course::Condition::ALL_CONDITIONS do |condition|
  next unless component_enabled?(condition[:name]) && condition[:active]

  condition_model = condition[:name].constantize.model_name
  json.name condition_model.human
  json.url url_for([:new, current_course, conditional, condition_model.singular_route_key.to_sym])
end

json.conditions conditional.specific_conditions do |actable|
  json.partial! 'course/condition/condition_list_data.json', condition: actable
  json.type actable.class.name.demodulize
  json.editUrl url_for([:edit, current_course, conditional, actable])
  json.deleteUrl url_for([current_course, conditional, actable])
end
