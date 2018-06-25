# frozen_string_literal: true

seek_time = local_assigns[:seek_time]
hide_next = local_assigns[:hide_next]

json.video do
  json.videoUrl video.url
  unless hide_next
    json.partial! 'course/video/submission/submissions/watch_next_video_url',
                  locals: { next_video: video.next_video }
  end
  json.initialSeekTime seek_time
end
