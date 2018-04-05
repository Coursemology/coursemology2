# frozen_string_literal: true
# Response with the uploaded materials
json.materials @materials do |material|
  json.partial! 'course/material/material', material: material, folder: @folder
end
