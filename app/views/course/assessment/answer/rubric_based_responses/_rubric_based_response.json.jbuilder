# frozen_string_literal: true
json.questionType answer.question.question_type

json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id

  if answer.submission.workflow_state == 'attempting'
    json.answer_text answer.answer_text
  else
    json.answer_text format_ckeditor_rich_text(answer.answer_text)
  end
end

last_attempt = last_attempt(answer)
attempt = answer.current_answer? ? last_attempt : answer

job = attempt&.auto_grading&.job

if job
  json.autograding do
    json.path job_path(job) if job.submitted?
    json.partial! "jobs/#{job.status}", job: job
  end
end

if attempt.submitted? && !attempt.auto_grading
  json.autograding do
    json.status :submitted
  end
end

json.partial! 'course/assessment/answer/rubric_category_grades', answer: answer, can_grade: can_grade

json.partial! 'course/assessment/answer/ai_generated_comment', answer: answer, can_grade: can_grade
json.partial! 'course/assessment/answer/rubric_explanation', last_attempt: last_attempt

if answer.current_answer? && !last_attempt.current_answer?
  json.latestAnswer do
    json.partial! last_attempt, answer: last_attempt
  end
end
