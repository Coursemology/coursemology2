# frozen_string_literal: true
json.conditionsData do
  json.partial! 'course/condition/enabled_conditions', conditional: conditional
  json.conditions do
    json.partial! 'course/condition/conditions', conditional: conditional
  end
end
