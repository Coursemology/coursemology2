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
  # The official grade breakdown now lives on the v2 grading evaluation (selections keyed by the graded
  # rubric's category/criterion ids). Grade comes from the immutable criterion; an ungraded category has
  # no criterion.
  grading_selections = answer.acting_as.grading_rubric_evaluation&.selections&.includes(:criterion) || []
  # Only the criterion breakdown is sent; the FE derives the "moderation" adjustment as answer.grade minus
  # this breakdown (it is not a real category/selection in v2).
  json.categoryGrades grading_selections do |selection|
    criterion = selection.criterion

    json.id selection.id
    json.gradeId criterion&.id
    json.categoryId selection.category_id
    json.grade criterion&.grade
    # The selected criterion's (rubric-level) explanation; v2 no longer stores a per-answer explanation.
    json.explanation criterion ? format_ckeditor_rich_text(criterion.explanation) : nil
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

if answer.can_read_grade?(current_ability)
  json.explanation do
    json.correct last_attempt&.correct
    json.explanations []
  end
end

if answer.current_answer? && !last_attempt.current_answer?
  json.latestAnswer do
    json.partial! last_attempt, answer: last_attempt
  end
end
