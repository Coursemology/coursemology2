json.partial! 'survey', survey: @survey
json.questions do
  json.array! @survey.questions.includes(:options), partial: 'course/survey/questions/question', as: :question
end
