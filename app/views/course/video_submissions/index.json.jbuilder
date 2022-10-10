# frozen_string_literal: true

json.videoSubmissions @videos do |video|
  submission = @video_submissions_hash[video.id]
  json.id video.id
  json.title video.title
  if submission
    json.videoSubmissionUrl course_video_submission_path(current_course, video, submission)
    json.createdAt submission.created_at
    json.percentWatched submission.statistic&.percent_watched
  end
end
