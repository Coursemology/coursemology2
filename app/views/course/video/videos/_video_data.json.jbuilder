# frozen_string_literal: true

json.partial! 'video_list_data', video: video, can_analyze: can?(:analyze, video)
json.videoStatistics do
  json.partial! 'video_statistics'
end
