# frozen_string_literal: true
# A test case definition. Belongs to the question, not to any grading run -- see _test_result for
# the outcome of running it.

json.id test_case.id
json.identifier test_case.identifier if can_read_tests
json.expression test_case.expression
json.expected test_case.expected
