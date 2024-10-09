# frozen_string_literal: true
question = @question.specific

# If a non current_answer is being loaded, use it instead of loading the last_attempt.
is_current_answer = answer.current_answer?
latest_answer = last_attempt(answer)
attempt = is_current_answer ? latest_answer : answer
auto_grading = attempt&.auto_grading&.specific

json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
  json.files_attributes answer.files do |file|
    json.(file, :id, :filename)
    json.content file.content
    json.highlightedContent highlight_code_block(file.content, question.language)
  end
end

can_read_tests = can?(:read_tests, @submission)
show_private = can_read_tests || (@submission.published? && @assessment.show_private?)
show_evaluation = can_read_tests || (@submission.published? && @assessment.show_evaluation?)

test_cases_by_type = question.test_cases_by_type
test_cases_and_results = get_test_cases_and_results(test_cases_by_type, auto_grading)

show_stdout_and_stderr = (can_read_tests || current_course.show_stdout_and_stderr) &&
                         auto_grading && auto_grading&.exit_code != 0

displayed_test_case_types = ['public_test']
displayed_test_case_types << 'private_test' if show_private
displayed_test_case_types << 'evaluation_test' if show_evaluation

json.testCases do
  json.canReadTests can_read_tests

  # Get all historical auto gradings
  historical_auto_gradings = get_historical_auto_gradings(auto_grading)

  # Include current and historical auto gradings
  json.tests (historical_auto_gradings + [auto_grading]).each do |ag|
    question = ag.test_results.first.test_case.question
    test_cases_by_type = question.test_cases_by_type
    test_cases_and_results = get_test_cases_and_results(test_cases_by_type, ag)

    json.questionId question.id
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
      json.(ag, :stdout, :stderr) if show_stdout_and_stderr
    end
  end
end

if answer.codaveri_feedback_job_id && question.is_codaveri
  codaveri_job = answer.codaveri_feedback_job
  json.codaveriFeedback do
    json.jobId answer.codaveri_feedback_job_id
    json.jobStatus codaveri_job.status
    json.jobUrl job_path(codaveri_job) if codaveri_job.status == 'submitted'
    json.errorMessage codaveri_job.error['message'] if codaveri_job.error
  end
end
