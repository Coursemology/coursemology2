# frozen_string_literal: true

topic = video_topic.acting_as
video = video_topic.video
creator = video_topic.creator
submission = video.submissions.by_user(creator).first

json.id topic.id
json.title video.title
json.creator do
  user = submission.creator
  json.id user.id
  json.name display_user(user)
  json.imageUrl user.profile_photo.url
end
json.timestamp Time.at(video_topic.timestamp).utc.strftime('%H:%M:%S')

json.partial! 'topic', topic: topic

# TODO: remove links, change to frontend if possible
json.links do
  json.titleLink edit_course_video_submission_path(current_course, video, submission,
                                                   params: { scroll_to_topic: video_topic })
end
