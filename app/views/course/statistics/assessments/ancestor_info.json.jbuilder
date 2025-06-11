# frozen_string_literal: true
json.array! @ancestors do |ancestor|
  json.id ancestor.id
  json.title ancestor.title
  json.courseTitle ancestor.course&.title
end
