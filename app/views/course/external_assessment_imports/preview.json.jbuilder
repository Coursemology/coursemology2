# frozen_string_literal: true
json.ok @result[:ok]
json.unresolved @result[:unresolved]
json.malformed @result[:malformed]
json.sample @result[:sample] do |row|
  json.studentName row[:studentName]
  json.grades row[:grades]
end
json.conflicts @result[:conflicts] do |c|
  json.component c[:component]
  json.studentName c[:studentName]
  json.existingGrade c[:existingGrade]
  json.inFileGrade c[:inFileGrade]
  json.identifierMismatch c[:identifierMismatch]
end
json.outOfRange @result[:out_of_range]
