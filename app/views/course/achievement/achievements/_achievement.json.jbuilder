json.attributes do
  json.(@achievement, :id, :title, :description, :published)
  json.badge do
    json.url achievement_badge_path(@achievement)
    json.name @achievement[:badge]
  end
end

json.partial! 'course/condition/conditions.json', conditional: @achievement
