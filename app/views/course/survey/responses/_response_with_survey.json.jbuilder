json.survey do
  json.partial! 'course/survey/surveys/survey_with_questions', survey: survey
end
json.response do
  json.partial! 'response', response: response
end
