json.video do
  json.videoUrl @video.url
end

json.statistics do
  json.watchFrequency @video.watch_frequency
end
