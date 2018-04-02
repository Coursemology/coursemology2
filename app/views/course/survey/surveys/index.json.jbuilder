# frozen_string_literal: true
json.surveys @surveys, partial: 'survey.json', as: :survey
json.canCreate can?(:create, Course::Survey.new(course: current_course))
