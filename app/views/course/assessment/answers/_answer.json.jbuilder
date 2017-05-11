json.(answer, :id)

answer = answer.specific
json.partial! answer, answer: answer, can_grade: can_grade

last_attempt = last_attempt(answer)
if last_attempt && last_attempt.auto_grading && last_attempt.auto_grading.result
  json.last_attempt do
    json.correct last_attempt.correct?
    json.explanations last_attempt.auto_grading.result['messages'].each do |explanation|
      format_html(explanation)
    end
  end
end

json.grader display_user(answer.grader) if answer&.grader && can_grade
if can_grade || submission.published?
  json.grade (answer&.grade || 0).to_f
  json.maximum_grade answer.question.maximum_grade.to_f
end
