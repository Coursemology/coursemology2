json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
  question = answer.question.specific

  json.answer_text answer.answer_text unless question.hide_text
  json.file do
    json.name answer.attachment&.name
  end if question.allow_attachment?
end

last_attempt = last_attempt(answer)

json.explanation do
  assessment = answer.submission.assessment
  if assessment.autograded? && last_attempt&.auto_grading&.result
    json.correct last_attempt.correct?
    json.explanations last_attempt.auto_grading.result['messages'].each do |explanation|
      format_html(explanation)
    end
  end
end
