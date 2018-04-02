# frozen_string_literal: true
json.condition_attributes do
  json.new_condition_urls Course::Condition::ALL_CONDITIONS do |condition|
    next unless component_enabled?(condition)

    condition_model = condition.constantize.model_name
    json.name condition_model.human
    json.url url_for([:new, current_course, conditional, condition_model.singular_route_key])
  end

  json.conditions conditional.specific_conditions do |actable|
    json.partial! "#{actable.to_partial_path}.json", course: current_course, condition: actable, conditional: conditional
  end
end

