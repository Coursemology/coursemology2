# frozen_string_literal: true
json.nodes(@nodes.map { |node| node.deep_transform_keys { |key| key.to_s.camelize(:lower) } })
json.canModify @can_modify
