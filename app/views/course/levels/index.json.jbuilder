# frozen_string_literal: true
json.levels @levels.pluck(:experience_points_threshold)
json.canManage can?(:manage, @levels.first)
