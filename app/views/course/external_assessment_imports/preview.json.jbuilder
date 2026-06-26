# frozen_string_literal: true
json.ok @result[:ok]
json.unresolved @result[:unresolved]
json.malformed @result[:malformed]
json.sample @result[:sample] do |row|
  json.identifier row[:identifier]
  json.grades row[:grades]
end
json.conflictRows @result[:conflict_rows] do |row|
  json.identifier row[:identifier]
  json.studentName row[:studentName]
  json.cells row[:cells]
end
json.outOfRange @result[:out_of_range] do |cell|
  json.identifier cell[:identifier]
  json.component cell[:component]
  json.grade cell[:grade]
  json.max cell[:max]
  json.kind cell[:kind]
end
json.reassignments @result[:reassignments] do |entry|
  json.identifier entry[:identifier]
  json.currentStudent entry[:currentStudent]
  json.previousStudents entry[:previousStudents]
end
json.totalRows @result[:total_rows]
json.columnOrder @result[:column_order]
