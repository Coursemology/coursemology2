# frozen_string_literal: true
submission = answer.submission
assessment = submission.assessment
question = answer.question.specific
# If a non current_answer is being loaded, use it instead of loading the last_attempt.
is_current_answer = answer.current_answer?
latest_answer = last_attempt(answer)
attempt = is_current_answer ? latest_answer : answer
auto_grading = attempt&.auto_grading&.specific

# Required in response of reload_answer and submit_answer to update past answers with the latest_attempt
# Removing this check will cause it to render the latest_answer recursively
if is_current_answer && !latest_answer.current_answer?
  json.latestAnswer do
    json.partial! latest_answer, answer: latest_answer
    json.partial! 'course/assessment/answer/programming/annotations', programming_files: latest_answer.specific.files,
                                                                      can_grade: can?(:grade, submission)
  end
end

json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
  json.files_attributes answer.files do |file|
    json.(file, :id, :filename)
    json.content file.content
    json.highlighted_content highlight_code_block(file.content, question.language)
  end
end

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

can_read_tests = can?(:read_tests, submission)
show_private = can_read_tests || (submission.published? && assessment.show_private?)
show_evaluation = can_read_tests || (submission.published? && assessment.show_evaluation?)

test_cases_by_type = question.test_cases_by_type
test_cases_and_results = get_test_cases_and_results(test_cases_by_type, auto_grading)

show_stdout_and_stderr = (can_read_tests || current_course.show_stdout_and_stderr) &&
                         auto_grading && auto_grading&.exit_code != 0

displayed_test_case_types = ['public_test']
displayed_test_case_types << 'private_test' if show_private
displayed_test_case_types << 'evaluation_test' if show_evaluation

json.testCases do
  json.canReadTests can_read_tests
  displayed_test_case_types.each do |test_case_type|
    show_public = (test_case_type == 'public_test') && current_course.show_public_test_cases_output
    show_testcase_outputs = can_read_tests || show_public
    json.set! test_case_type do
      if test_cases_and_results[test_case_type].present?
        json.array! test_cases_and_results[test_case_type] do |test_case, test_result|
          json.identifier test_case.identifier if can_read_tests
          json.expression test_case.expression
          json.expected test_case.expected
          if test_result
            json.output get_output(test_result) if show_testcase_outputs
            json.passed test_result.passed?
          end
        end
      end
    end
  end

  json.(auto_grading, :stdout, :stderr) if show_stdout_and_stderr
end

failed_test_cases_by_type = get_failed_test_cases_by_type(test_cases_and_results)

json.explanation do
  if attempt
    explanations = []

    if failed_test_cases_by_type['public_test']
      failed_test_cases_by_type['public_test'].each do |test_case, test_result|
        explanations << format_ckeditor_rich_text(get_hint(test_case, test_result))
      end
      json.failureType 'public_test'

    elsif failed_test_cases_by_type['private_test']
      failed_test_cases_by_type['private_test'].each do |test_case, test_result|
        explanations << format_ckeditor_rich_text(get_hint(test_case, test_result))
      end
      json.failureType 'private_test'
    end

    json.correct attempt&.auto_grading && attempt&.correct
    json.explanations explanations
  end
end

json.isDraftAnswer answer.draft_answer?
json.attemptsLeft answer.attempting_times_left if question.attempt_limit

if answer.codaveri_feedback_job_id && question.is_codaveri
  codaveri_job = answer.codaveri_feedback_job
  json.codaveriFeedback do
    json.jobId answer.codaveri_feedback_job_id
    json.jobStatus codaveri_job.status
    json.jobUrl job_path(codaveri_job) if codaveri_job.status == 'submitted'
    json.errorMessage codaveri_job.error['message'] if codaveri_job.error
  end
end
