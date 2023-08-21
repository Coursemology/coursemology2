# frozen_string_literal: true

topic = video_topic.acting_as
video = video_topic.video
creator = video_topic.creator
submission = video.submissions.by_user(creator).first

json.id topic.id
json.title video.title
json.creator do
  creator = submission.creator
  user = @course_users_hash.fetch(creator.id, creator)
  json.id user.id
  json.userUrl url_to_user_or_course_user(current_course, user)
  json.name display_user(creator)
  json.imageUrl user_image(creator)
end
json.timestamp Time.at(video_topic.timestamp).utc.strftime('%H:%M:%S')

json.partial! 'topic', topic: topic, can_grade: true

json.links do
  json.titleLink edit_course_video_submission_path(current_course, video, submission,
                                                   params: { scroll_to_topic: video_topic })
end
