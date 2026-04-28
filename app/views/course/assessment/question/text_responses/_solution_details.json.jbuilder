# frozen_string_literal: true
json.solutions question.solutions do |sol|
  json.id sol.id
  json.solutionType sol.solution_type
  json.solution sol.solution
  json.grade sol.grade
  json.explanation sol.explanation
  json.spreadsheets sol.test_spreadsheets.map do |sheet|
    json.id sheet.id
    json.filename sheet.attachment.name
    json.size sheet.attachment.open(binmode: true) { |f| f.size }
  end
end
