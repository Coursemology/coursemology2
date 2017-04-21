question = answer.question.specific
json.allow_attachment question.allow_attachment? unless question.hide_text?

json.answer_text answer.answer_text unless question.hide_text
json.file do
  json.name answer.attachment&.name
end if question.allow_attachment?
