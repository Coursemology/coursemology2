# frozen_string_literal: true
json.partial! 'course/assessment/question/programming/metadata/default', data: data

json.submitAsFile data[:submit_as_file]

json.submissionFiles data[:submission_files]&.each do |submission_file|
  json.partial! 'course/assessment/question/programming/metadata/partials/file', file: submission_file
end

json.solutionFiles data[:solution_files]&.each do |solution_file|
  json.partial! 'course/assessment/question/programming/metadata/partials/file', file: solution_file
end
