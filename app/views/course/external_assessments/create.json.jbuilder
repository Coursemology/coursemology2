# frozen_string_literal: true
json.assessment do
  json.partial! 'external_assessment', external_assessment: @external_assessment
  if @weighted_view_enabled
    json.gradebookWeight(@external_assessment.gradebook_contribution&.weight&.to_f || 0)
  end
end
json.tab do
  json.id @external_assessment.synthetic_tab_id
  json.title @external_assessment.title
  json.categoryId Course::ExternalAssessment::SYNTHETIC_CATEGORY_ID
  if @weighted_view_enabled
    json.gradebookWeight(@external_assessment.gradebook_contribution&.weight&.to_f || 0)
    json.weightMode 'equal'
  end
end
json.category do
  json.id Course::ExternalAssessment::SYNTHETIC_CATEGORY_ID
  json.title Course::ExternalAssessment::SYNTHETIC_CATEGORY_TITLE
end
