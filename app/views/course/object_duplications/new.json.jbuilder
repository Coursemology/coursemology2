# frozen_string_literal: true
json.currentHost current_tenant.host

json.destinationCourses @destination_courses do |course|
  json.(course, :id, :title)
  json.path course_path(course)
  json.host course.instance.host
  json.rootFolder do
    root_folder = @root_folder_map[course.id]
    json.subfolders root_folder.children.map(&:name)
    json.materials root_folder.materials.map(&:name)
  end
  json.enabledComponents map_components_to_frontend_tokens(course.enabled_components)
  json.unduplicableObjectTypes(course.disabled_cherrypickable_types.map do |klass|
    cherrypickable_items_hash[klass]
  end)
end

sorted_destination_instances = @destination_instances.sort_by { |i| [i.id == current_tenant.id ? 0 : 1, i.name] }
json.destinationInstances sorted_destination_instances do |instance|
  json.id instance.id
  json.name instance.name
  json.host instance.host
end

json.metadata do
  json.canDuplicateToAnotherInstance can?(:duplicate_across_instances, current_tenant)
  json.currentInstanceId current_tenant.id
end

json.partial! 'course_duplication_data'
