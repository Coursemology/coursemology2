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

if can_grade || (@assessment.show_rubric_to_students? && @submission.published?)
  json.categoryGrades answer.selections.includes(:criterion).map do |selection|
    criterion = selection.criterion

    json.id selection.id
    json.gradeId criterion&.id
    json.categoryId selection.category_id
    json.grade criterion ? criterion.grade : selection.grade
    json.explanation criterion ? nil : selection.explanation
  end
end

if can_grade
  posts = answer.submission.submission_questions.find_by(question_id: answer.question_id)&.discussion_topic&.posts
  ai_generated_comment = posts&.select do |post|
    post.is_ai_generated && post.workflow_state == 'draft'
  end&.last
  if ai_generated_comment
    json.aiGeneratedComment do
      json.partial! ai_generated_comment
    end
  end
end

json.explanation do
  json.correct last_attempt&.correct
  json.explanations []
end

if answer.current_answer? && !last_attempt.current_answer?
  json.latestAnswer do
    json.partial! last_attempt, answer: last_attempt
  end
end
