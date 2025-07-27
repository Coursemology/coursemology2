# frozen_string_literal: true

json.id test_result.test_case_id
json.output get_output(test_result) if show_output
json.passed test_result.passed?
