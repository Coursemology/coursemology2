# frozen_string_literal: true
# The outcome of running one test case in one grading run. `id` is the id of the test case this
# result is for, so the client can join it against the test case definitions.

json.id test_result.test_case_id
json.output get_output(test_result) if show_output
json.passed test_result.passed?
