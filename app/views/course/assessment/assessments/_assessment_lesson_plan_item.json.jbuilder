json.partial! 'course/lesson_plan/items/item.json.jbuilder', item: item

json.lesson_plan_item_type @assessment_tabs_titles_hash[item.tab_id]
json.item_path course_assessment_path(current_course, item)
if can?(:attempt, @assessment) && !item.folder.materials.empty?
  json.materials do
    json.array! item.folder.materials.includes(:attachment_references).map do |material|
      json.name format_inline_text(material.name)
      json.url url_for([current_course, item.folder, material])
    end
  end
end
