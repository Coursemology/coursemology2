# frozen_string_literal: true
json.surveys @surveys do |survey|
  json.partial! 'survey', survey: survey, survey_time: survey.time_for(current_course_user)
end

json.canCreate can?(:create, Course::Survey.new(course: current_course))
