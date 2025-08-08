# frozen_string_literal: true
json.embedSrc @embed_src

json.assessment do
  json.baseExp @scholaistic_assessment.base_exp if current_course.gamified?
end

json.display do
  json.assessmentTitle @scholaistic_assessment.title
  json.isGamified current_course.gamified?
  json.assessmentsTitle current_course.settings(:course_scholaistic_component)&.assessments_title
end
