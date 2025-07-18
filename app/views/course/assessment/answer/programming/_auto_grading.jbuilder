# frozen_string_literal: true

json.id auto_grading.id
json.createdAt auto_grading.created_at.iso8601
graded_snapshot = auto_grading.question_snapshot || question
json.gradedOnPastSnapshot graded_snapshot != question
test_cases_by_type = graded_snapshot.test_cases_by_type

show_private = can_read_tests || (submission.published? && assessment.show_private?)
show_evaluation = can_read_tests || (submission.published? && assessment.show_evaluation?)

test_cases_and_results = get_test_cases_and_results(test_cases_by_type, auto_grading)

show_stdout_and_stderr = (can_read_tests || current_course.show_stdout_and_stderr) &&
                         auto_grading.exit_code != 0

displayed_test_case_types = ['public_test']
displayed_test_case_types << 'private_test' if show_private
displayed_test_case_types << 'evaluation_test' if show_evaluation

job = auto_grading.job
if job
  json.job do
    json.path job_path(job) if job.submitted?
    json.partial! "jobs/#{job.status}", job: job
  end
end

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
