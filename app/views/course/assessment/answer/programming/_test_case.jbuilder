# frozen_string_literal: true

json.id test_case.id
json.identifier test_case.identifier if can_read_tests
json.expression test_case.expression
json.expected test_case.expected
