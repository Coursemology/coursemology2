# frozen_string_literal: true

json.breadcrumbs @folder.ancestors.reverse << @folder do |folder|
  json.id folder.id
  json.name folder.parent_id.nil? ? @settings.title || t('course.material.sidebar_title') : folder.name
end
