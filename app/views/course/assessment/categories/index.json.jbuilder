json.categories do
  json.partial! 'category.json', collection: @categories, as: :category
end
