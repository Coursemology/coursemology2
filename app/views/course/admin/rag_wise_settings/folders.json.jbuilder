# frozen_string_literal: true
json.folders @folders do |folder|
  json.id folder.id
  json.parentId folder.parent_id
  json.name folder.name
end
