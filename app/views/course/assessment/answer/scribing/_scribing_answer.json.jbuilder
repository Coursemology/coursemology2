json.scribing_answer do
  json.image_path attachment_reference_path(scribing_answer.question.actable.attachment_references[0])
  json.user_id current_user.id
  json.answer_id scribing_answer.id
  json.scribbles scribing_answer.actable.scribbles do |scribble|
    json.(scribble, :content)
    json.creator_name scribble.creator.name
    json.creator_id scribble.creator.id
  end
end
