# frozen_string_literal: true
json.questionType answer.question.question_type

json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
  question = answer.question.specific
  if question.hide_text
    json.answer_text nil
  elsif answer.submission.workflow_state == 'attempting'
    json.answer_text answer.answer_text
  else
    json.answer_text format_ckeditor_rich_text(answer.answer_text)
  end
end

json.attachments answer.attachments do |attachment|
  json.id attachment.id
  json.name attachment.name
  json.url attachment_reference_url(attachment)
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

if answer.can_read_grade?(current_ability)
  json.explanation do
    json.correct last_attempt&.correct
    if last_attempt&.auto_grading&.result
      json.explanations(last_attempt.auto_grading.result['messages'].map { |e| format_ckeditor_rich_text(e) })
    else
      json.explanations []
    end
  end
end

if (
  can_grade || (@assessment.show_rubric_to_students? && @submission.published?)
) && last_attempt&.auto_grading&.result&.dig('evaluation_results')
  graded_solutions =
    last_attempt.auto_grading.result['evaluation_results'].index_by do |result|
      result['solution_id']
    end
  json.solutionResults answer.question.specific.solutions do |solution|
    result = graded_solutions[solution.id]
    json.id solution.id
    json.maximumGrade solution.grade.to_f
    json.grade result['grade'].to_f if result
    json.solution solution.solution
    json.solutionType solution.solution_type
    json.tests result['tests'] if result && result['tests']
  end
end

# Required in response of reload_answer and submit_answer to update past answers with the latest_attempt
# Removing this check will cause it to render the latestAnswer recursively
if answer.current_answer? && !last_attempt.current_answer?
  json.latestAnswer do
    json.partial! last_attempt, answer: last_attempt
  end
end
