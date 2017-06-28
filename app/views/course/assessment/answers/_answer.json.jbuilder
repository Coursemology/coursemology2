json.questionId answer.question_id

last_attempt = last_attempt(answer)
specific_answer = answer.specific
can_grade = can?(:grade, answer.submission)

json.partial! specific_answer, answer: specific_answer, can_grade: can_grade

json.grading do
  json.id answer.id
  json.grader display_user(answer.grader) if answer&.grader && can_grade
  if can_grade || answer.submission.published?
    json.grade (answer&.grade || 0).to_f
  end
end
