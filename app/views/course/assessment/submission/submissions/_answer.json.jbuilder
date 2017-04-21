json.(answer, :id)

answer_type = answer.actable_type.demodulize.underscore
answer = answer.specific
json.partial! answer_type, answer: answer

last_attempt = last_attempt(answer)
if last_attempt && last_attempt.auto_grading && last_attempt.auto_grading.result
  json.last_attempt do
    json.correct answer.correct?
    json.explanations answer.auto_grading.result['messages'].each do |explanation|
      format_html(explanation)
    end
  end
end

json.grader display_user(answer.grader) if answer&.grader && @can_grade
if @can_grade || @submission.published?
  json.grade (answer&.grade || 0).to_f
  json.maximum_grade answer.question.maximum_grade.to_f
end
