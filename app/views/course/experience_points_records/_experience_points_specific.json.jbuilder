# frozen_string_literal: true
actable = specific.actable
case actable
when Course::Assessment::Submission
  assessment = specific.assessment
  json.text assessment.title
when Course::Survey::Response
  response = specific
  survey = response.survey
  json.text survey.title
  if can?(:read_answers, response)
    json.link course_survey_response_path(current_course, survey, response)
  else
    json.link course_survey_responses_path(current_course, survey)
  end
end
