# frozen_string_literal: true
json.title @settings.title || ''
json.pagination @settings.pagination.to_i
json.markPostAsAnswerSetting @settings.mark_post_as_answer_setting
