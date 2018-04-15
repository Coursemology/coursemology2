# frozen_string_literal: true
json.attributes do
  json.(@assessment, :id, :title, :description, :start_at, :end_at, :bonus_end_at, :base_exp,
    :time_bonus_exp, :published, :autograded, :show_private, :show_evaluation, :skippable,
    :tabbed_view, :view_password, :session_password, :delayed_grade_publication, :tab_id)
end

json.tab_attributes do
  json.tab_title @tab.title
  json.category_title @category.title
  json.only_tab @category.tabs.count == 1 ? true : false
end

json.mode_switching @assessment.allow_mode_switching?
json.gamified current_course.gamified?

json.folder_attributes do
  json.folder_id @assessment.folder.id
  json.materials @assessment.materials.order(:name) do |material|
    json.partial! '/course/material/material.json', material: material, folder: @assessment.folder
  end
end

json.partial! 'course/condition/conditions.json', conditional: @assessment
