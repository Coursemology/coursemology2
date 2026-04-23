# frozen_string_literal: true
json.solutions question.solutions do |sol|
  json.id sol.id
  json.solutionType sol.solution_type
  json.solution sol.solution
  json.grade sol.grade
  json.explanation sol.explanation
  json.spreadsheet do
    json.id sol.test_spreadsheet.id
    json.filename sol.test_spreadsheet.attachment.name
    json.size sol.test_spreadsheet.attachment_size
    json.isRandomizationEnabled sol.test_spreadsheet.is_randomization_enabled
    json.variables sol.test_spreadsheet.variables
  end if sol.test_spreadsheet
end
