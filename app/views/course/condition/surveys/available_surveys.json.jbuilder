# frozen_string_literal: true
json.ids @available_surveys.map(&:id)

json.surveys do
  @available_surveys.each do |survey|
    json.set! survey.id, {
      title: survey.title,
      url: course_survey_path(current_course, survey)
    }
  end
end
