json.(category, :id, :title, :weight)

json.tabs do
  json.array! category.tabs do |tab|
    json.(tab, :id, :title, :weight)
  end
end
