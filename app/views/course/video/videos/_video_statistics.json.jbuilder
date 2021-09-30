# frozen_string_literal: true
json.video do
  json.videoUrl @video.url
end

json.statistics do
  json.watchFrequency @video.statistic&.watch_freq || @video.watch_frequency
end
