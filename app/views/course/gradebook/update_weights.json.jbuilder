# frozen_string_literal: true
# Echoes the weights that were just persisted (a save acknowledgement, not a
# resource fetch), alongside the persisted level contribution and cap policy.
json.weights @updates do |u|
  json.tabId u[:tab_id]
  json.weight u[:weight]
  json.weightMode u[:weight_mode].to_s
  json.keepHighest u[:keep_highest]
  json.excludedAssessmentIds u[:excluded_assessment_ids]
  if u[:weight_mode].to_s == 'custom'
    json.assessmentWeights u[:assessment_weights] do |aw|
      json.assessmentId aw[:assessment_id]
      json.weight aw[:weight]
    end
  end
end

if @level_config
  json.levelContribution do
    json.partial! 'course/gradebook/level_contribution', level_config: @level_config
  end
end

json.capTotal @settings.cap_weighted_total
