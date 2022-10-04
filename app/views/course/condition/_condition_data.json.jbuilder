# frozen_string_literal: true
json.conditionsData do
  json.partial! 'course/condition/enabled_conditions.json', conditional: conditional
  json.conditions do
    json.partial! 'course/condition/conditions.json', conditional: conditional
  end
end
