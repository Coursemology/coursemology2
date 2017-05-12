json.id answer.id
json.questionId answer.question_id

answer = answer.specific
json.partial! answer, answer: answer, can_grade: can_grade

if answer.auto_grading && answer.auto_grading.result
  json.correct answer.correct?
  json.explanations answer.auto_grading.result['messages'].each do |explanation|
    format_html(explanation)
  end
end

json.grader display_user(answer.grader) if answer&.grader && can_grade
if can_grade || submission.published?
  json.grade (answer&.grade || 0).to_f
end
