# frozen_string_literal: true

json.id auto_grading.id
json.createdAt auto_grading.created_at.iso8601
graded_snapshot = auto_grading.question_snapshot || question
json.gradedOnPastSnapshot graded_snapshot.current_id != graded_snapshot.id

test_cases_by_type = graded_snapshot.test_cases_by_type
test_results_by_type = get_test_results_by_type(test_cases_by_type, auto_grading)

show_stdout_and_stderr = (can_read_tests || current_course.show_stdout_and_stderr) &&
                         auto_grading.exit_code != 0

job = auto_grading.job
if job
  json.job do
    json.path job_path(job) if job.submitted?
    json.partial! "jobs/#{job.status}", job: job
  end
end

json.testCases do
  displayed_test_case_types.each do |test_case_type|
    json.set! test_case_type do
      if test_cases_by_type[test_case_type].present?
        json.array! test_cases_by_type[test_case_type] do |test_case|
          json.partial! 'course/assessment/answer/programming/test_case',
                        test_case: test_case,
                        can_read_tests: can_read_tests
        end
      end
    end
  end
end

json.testResults do
  displayed_test_case_types.each do |test_case_type|
    show_public = (test_case_type == 'public_test') && current_course.show_public_test_cases_output
    show_testcase_outputs = can_read_tests || show_public
    json.set! test_case_type do
      if test_results_by_type[test_case_type].present?
        test_results_by_type[test_case_type].entries.each do |test_case, test_result|
          json.set! test_case.id do
            json.partial! 'course/assessment/answer/programming/test_result',
                          test_result: test_result,
                          show_output: show_testcase_outputs
          end
        end
      end
    end
  end
end

json.(auto_grading, :stdout, :stderr) if show_stdout_and_stderr
