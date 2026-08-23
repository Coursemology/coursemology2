# frozen_string_literal: true
json.title @settings.title || ''
json.pagination @settings.pagination.to_i
json.isShowingAiGeneratedComments @settings.is_showing_ai_generated_comments
