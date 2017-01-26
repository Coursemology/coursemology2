json.surveys do
  json.surveys do
    json.array! surveys, partial: 'survey.json', as: :survey
  end
  json.canCreate can?(:create, Course::Survey.new)
end
