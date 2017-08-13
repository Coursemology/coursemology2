json.scribing_answer do
  json.image_path attachment_reference_path(answer.question.actable.attachment_references[0])
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
