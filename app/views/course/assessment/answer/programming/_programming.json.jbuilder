# frozen_string_literal: true
submission = answer.submission
assessment = submission.assessment
question = answer.question.specific
# If a non current_answer is being loaded, use it instead of loading the last_attempt.
is_current_answer = answer.current_answer?
latest_answer = last_attempt(answer)
attempt = is_current_answer ? latest_answer : answer
auto_grading = attempt&.auto_grading&.specific

can_grade = can?(:grade, submission)

# Required in response of reload_answer and submit_answer to update past answers with the latest_attempt
# Removing this check will cause it to render the latest_answer recursively
if is_current_answer && !latest_answer.current_answer?
  json.latestAnswer do
    json.partial! latest_answer, answer: latest_answer
    json.partial! 'course/assessment/answer/programming/annotations', programming_files: latest_answer.specific.files,
                                                                      can_grade: can_grade
  end
end

json.questionType answer.question.question_type

json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
  json.files_attributes answer.files do |file|
    json.(file, :id, :filename)
    json.content file.content
    json.highlightedContent highlight_code_block(file.content, question.language)
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

show_stdout_and_stderr = (can_read_tests || current_course.show_stdout_and_stderr) &&
                         auto_grading && auto_grading&.exit_code != 0

displayed_test_case_types = ['public_test']
displayed_test_case_types << 'private_test' if show_private
displayed_test_case_types << 'evaluation_test' if show_evaluation

# Test case definitions and the results of grading against them are serialized separately, joined on
# test case id: a test case belongs to the question, while a result belongs to one grading run.
# Both hashes cover every type on the question -- the explanation below needs evaluation tests even
# when they are not displayed -- but only the displayed types are rendered.
test_cases_by_type = question.test_cases_by_type
test_results_by_type = get_test_results_by_type(test_cases_by_type, auto_grading)

json.canReadTests can_read_tests

json.testCases do
  displayed_test_case_types.each do |test_case_type|
    json.set! test_case_type do
      json.array!(test_cases_by_type[test_case_type] || []) do |test_case|
        json.partial! 'course/assessment/answer/programming/test_case',
                      test_case: test_case, can_read_tests: can_read_tests
      end
    end
  end
end

# Absent entirely when the answer has not been graded, so that the client can tell "not yet run"
# from "run, and every test case failed".
if auto_grading
  json.testResults do
    displayed_test_case_types.each do |test_case_type|
      show_public = (test_case_type == 'public_test') && current_course.show_public_test_cases_output
      show_testcase_outputs = can_read_tests || show_public
      json.set! test_case_type do
        (test_results_by_type[test_case_type] || {}).each do |test_case_id, test_result|
          json.set! test_case_id do
            json.partial! 'course/assessment/answer/programming/test_result',
                          test_result: test_result, show_output: show_testcase_outputs
          end
        end
      end
    end
  end
end

json.(auto_grading, :stdout, :stderr) if show_stdout_and_stderr

first_failure_by_type = get_first_failure_by_type(test_cases_by_type, test_results_by_type)

json.explanation do
  if attempt
    explanations = []

    if (failure = first_failure_by_type['public_test'])
      explanations << format_ckeditor_rich_text(get_hint(*failure))
      json.failureType 'public_test'

    elsif (failure = first_failure_by_type['private_test'])
      explanations << format_ckeditor_rich_text(get_hint(*failure))
      json.failureType 'private_test'
    end

    passed_evaluation_tests = first_failure_by_type['evaluation_test'].blank?

    json.correct attempt&.auto_grading && attempt&.correct && (can_grade ? passed_evaluation_tests : true)
    json.explanations explanations
  end
end

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
