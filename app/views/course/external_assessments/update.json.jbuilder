# frozen_string_literal: true
json.assessment do
  json.partial! 'external_assessment', external_assessment: @external_assessment
end
json.tab do
  json.id @external_assessment.synthetic_tab_id
  json.title @external_assessment.title
  json.categoryId Course::ExternalAssessment::SYNTHETIC_CATEGORY_ID
end
