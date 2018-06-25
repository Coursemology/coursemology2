json.partial! @video, hide_next: true

json.statistics do
  json.watchFrequency @video.watch_frequency
  json.videoDuration @video.duration
end
