# frozen_string_literal: true
json.prepend data[:prepend]
json.submission data[:submission]
json.append data[:append]
json.solution data[:solution]

json.dataFiles data[:data_files]&.each do |data_file|
  json.partial! 'course/assessment/question/programming/metadata/partials/file', file: data_file
end

without_test_cases = local_assigns[:without_test_cases] || false

unless without_test_cases
  json.testCases do
    data[:test_cases]&.each do |type, test_cases|
      json.partial! 'course/assessment/question/programming/metadata/partials/test_cases',
                    type: type,
                    test_cases: test_cases
    end
  end
end
