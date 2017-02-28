questions ||= survey.questions.includes(:options)
json.partial! 'survey', survey: survey
json.questions questions, partial: 'course/survey/questions/question', as: :question
