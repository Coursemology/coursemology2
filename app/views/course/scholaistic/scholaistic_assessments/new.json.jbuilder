# frozen_string_literal: true
json.embedSrc @embed_src

json.display do
  json.assessmentsTitle current_course.settings(:course_scholaistic_component)&.assessments_title
end
