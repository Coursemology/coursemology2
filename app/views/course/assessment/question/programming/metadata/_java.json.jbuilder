# frozen_string_literal: true
json.partial! 'course/assessment/question/programming/metadata/default', data: data, without_test_cases: true

json.submitAsFile data[:submit_as_file]

json.submissionFiles data[:submission_files]&.each do |submission_file|
  json.partial! 'course/assessment/question/programming/metadata/partials/file', file: submission_file
end

json.solutionFiles data[:solution_files]&.each do |solution_file|
  json.partial! 'course/assessment/question/programming/metadata/partials/file', file: solution_file
end

json.testCases do
  data[:test_cases]&.each do |type, test_cases|
    json.set! type, test_cases.each do |test_case|
      json.expression test_case[:expression]
      json.expected test_case[:expected]
      json.hint test_case[:hint]
      json.inlineCode test_case[:inline_code]
    end
  end
end
