# frozen_string_literal: true
unless folder.materials.empty?
  json.files folder.materials.includes(:attachment_references).each do |material|
    json.id material.id
    json.name material.name
    json.url url_to_material(current_course, folder, material) if materials_enabled
  end
end
