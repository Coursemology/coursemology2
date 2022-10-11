# frozen_string_literal: true

submission = video.submissions.by_user(current_user)&.first&.id

json.partial! 'video_list_data', video: video, can_analyze: can?(:analyze, video), submission: submission
json.videoStatistics do
  json.partial! 'video_statistics'
end
