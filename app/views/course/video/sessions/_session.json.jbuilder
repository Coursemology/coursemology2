json.sessionStart session.session_start
json.sessionEnd session.session_end
json.lastVideoTime session.last_video_time

json.events do
  json.array! session.events do |event|
    json.sequenceNum event.sequence_num
    json.eventType event.event_type.humanize
    json.eventTime event.event_time
    json.videoTime event.video_time
  end
end
