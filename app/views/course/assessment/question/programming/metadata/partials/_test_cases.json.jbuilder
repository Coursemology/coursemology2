# frozen_string_literal: true
json.set! type, test_cases.each do |test_case|
  json.expression test_case[:expression]
  json.expected test_case[:expected]
  json.hint test_case[:hint]
end
