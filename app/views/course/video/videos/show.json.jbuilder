# frozen_string_literal: true
json.partial! @video, hide_next: true

json.statistics do
  json.watchFrequency @video.statistic&.watch_freq || @video.watch_frequency
  json.videoDuration @video.duration
end
