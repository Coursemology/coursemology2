# frozen_string_literal: true
json.categories do
  json.partial! 'category', collection: @categories, as: :category
end
