# frozen_string_literal: true
json.array! languages do |language|
  json.id language.id
  json.name language.name
  json.disabled !language.enabled
  json.whitelists do
    # we could return the other flags here, but they are currently not used by FE
    json.defaultEvaluator language.default_evaluator_whitelisted?
    json.codaveriEvaluator language.codaveri_evaluator_whitelisted?
  end
  json.dependencies language.class.dependencies
  json.editorMode language.ace_mode
end
