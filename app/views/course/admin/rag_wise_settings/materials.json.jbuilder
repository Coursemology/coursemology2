# frozen_string_literal: true
json.materials @materials do |material|
  json.id material.id
  json.folderId material.folder.id
  json.name material.name
  json.folderName material.folder.name
  json.workflowState material.workflow_state
  json.materialUrl url_to_material(current_course, material.folder, material)
end
