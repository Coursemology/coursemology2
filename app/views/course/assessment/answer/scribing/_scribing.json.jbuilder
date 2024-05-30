# frozen_string_literal: true
json.scribing_answer do
  json.image_url answer.question.actable.attachment_reference.generate_public_url
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

last_attempt = last_attempt(answer)

json.explanation do
  json.correct last_attempt&.correct
  json.explanations []
end
