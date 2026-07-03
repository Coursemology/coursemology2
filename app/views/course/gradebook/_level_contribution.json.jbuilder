# frozen_string_literal: true
# Shared level-contribution shape for a present LevelConfig. Rendered by both the
# gradebook index (enabled branch) and the update_weights save acknowledgement.
json.enabled level_config.enabled
json.formula level_config.formula
json.weight level_config.weight.to_f
json.show level_config.show
json.clamp level_config.clamp
