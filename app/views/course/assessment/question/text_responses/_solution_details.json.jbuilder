# frozen_string_literal: true
json.solutions question.solutions do |sol|
  json.id sol.id
  json.solutionType sol.solution_type
  json.solution sol.solution
  json.grade sol.grade
  json.explanation sol.explanation
  if sol.test_spreadsheet
    json.spreadsheet do
      json.id sol.test_spreadsheet.id
      json.file do
        json.name sol.test_spreadsheet.attachment.name
        json.url attachment_reference_path(sol.test_spreadsheet.attachment)
      end
      json.isRandomizationEnabled sol.test_spreadsheet.is_randomization_enabled
      json.isRandomSeedFixed sol.test_spreadsheet.is_random_seed_fixed
      json.randomSeed sol.test_spreadsheet.test_random_seed
      json.isTimestampFixed sol.test_spreadsheet.is_timestamp_fixed
      json.testTimestamp sol.test_spreadsheet.test_timestamp
      json.numRandomTests sol.test_spreadsheet.num_random_tests
      json.targetSheetName sol.test_spreadsheet.target_sheet_name
      json.variables sol.test_spreadsheet.variables
    end
  end
end
