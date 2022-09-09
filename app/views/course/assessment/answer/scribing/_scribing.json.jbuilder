# frozen_string_literal: true
json.scribing_answer do
  json.image_url attachment_reference_url(answer.question.actable.attachment_references[0])
  json.user_id current_user.id
  json.answer_id answer.id
  json.scribbles answer.actable.scribbles do |scribble|
    json.(scribble, :content)
    json.creator_name scribble.creator.name
    json.creator_id scribble.creator.id
  end
end

json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
end

json.answerStatus do
  json.isLatestAnswer true
end

last_attempt = last_attempt(answer)

json.explanation do
  json.correct last_attempt&.correct
  json.explanations []
end
