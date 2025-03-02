# frozen_string_literal: true
json.courses @courses do |course_hash|
  json.id course_hash[:course].id
  json.name course_hash[:course].title
  json.canManageCourse course_hash[:canManageCourse]
end
