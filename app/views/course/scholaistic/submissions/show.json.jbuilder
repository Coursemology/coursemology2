# frozen_string_literal: true
json.embedSrc @embed_src

json.display do
  json.assessmentTitle @scholaistic_assessment.title
  json.creatorName @creator_name
  json.assessmentsTitle current_course.settings(:course_scholaistic_component)&.assessments_title
end
