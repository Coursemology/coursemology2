json.surveys do
  json.surveys do
    json.array! surveys, partial: 'survey.json', as: :survey
  end
  json.create_path course_surveys_path(current_course) if can?(:create, Course::Survey.new)
end
