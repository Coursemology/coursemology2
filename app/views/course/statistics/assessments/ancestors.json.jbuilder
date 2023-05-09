# frozen_string_literal: true
json.assessments @assessments do |assessment|
  json.id assessment.id
  json.title assessment.title
  json.courseTitle assessment.course&.title
end
