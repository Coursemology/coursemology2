json.partial! 'survey', survey: survey
json.questions do
  json.array! questions, partial: 'course/survey/questions/question', as: :question
end
