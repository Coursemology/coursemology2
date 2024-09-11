# frozen_string_literal: true
json.levels @levels.map do |level|
  json.levelId level.id
  json.experiencePointsThreshold level.experience_points_threshold
end
json.canManage can?(:manage, @levels.first)
