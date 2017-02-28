json.surveys @surveys, partial: 'survey.json', as: :survey
json.canCreate can?(:create, Course::Survey.new(course: current_course))
