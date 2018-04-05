# frozen_string_literal: true
json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
  # single file input contains file url
  json.file do
    json.url answer&.attachment&.url
    json.name File.basename(answer&.attachment&.path || '')
  end
end

last_attempt = last_attempt(answer)

json.explanation do
  json.correct last_attempt&.correct
  json.explanations []
end
