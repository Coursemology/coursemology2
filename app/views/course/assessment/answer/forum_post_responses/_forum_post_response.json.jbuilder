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
  json.partial! 'course/assessment/submission/answer/forum_post_response/posts/post_packs',
                selected_posts: answer.compute_post_packs
end

last_attempt = last_attempt(answer)
attempt = answer.current_answer? ? last_attempt : answer

# The grading job's status, as for the other job-graded types. Rubric-graded forum answers are graded in a
# job; without this, a grading view opened mid-job would neither show nor poll it, and would leave the rubric
# editable while the job is about to overwrite it.
job = attempt&.auto_grading&.job

if job
  json.autograding do
    json.path job_path(job) if job.submitted?
    json.partial! "jobs/#{job.status}", job: job
  end
end

if attempt&.submitted? && !attempt.auto_grading
  json.autograding do
    json.status :submitted
  end
end

# Only rubric-graded forum questions carry a categoryGrades breakdown; default-graded answers are graded by
# the plain grade field, so emitting an (empty) breakdown would misroute their save through the rubric path.
if answer.question.grading_mode_rubric?
  json.partial! 'course/assessment/answer/rubric_category_grades', answer: answer, can_grade: can_grade
  json.partial! 'course/assessment/answer/ai_generated_comment', answer: answer, can_grade: can_grade
  json.partial! 'course/assessment/answer/rubric_explanation', last_attempt: last_attempt
elsif answer.can_read_grade?(current_ability)
  json.explanation do
    json.correct last_attempt&.correct
    json.explanations []
  end
end
