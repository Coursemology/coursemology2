# frozen_string_literal: true
json.partial! 'course/lesson_plan/items/item.json.jbuilder', item: item

json.lesson_plan_item_type @assessment_tabs_titles_hash[item.tab_id]
json.item_path course_assessment_path(current_course, item)
folder = @folder_loader.folder_for_assessment(item.id)
if can?(:attempt, @assessment) && !folder.materials.empty?
  json.materials folder.materials do |material|
    json.partial! "course/material/material", material: material, folder: folder
  end
end
