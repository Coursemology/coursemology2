# frozen_string_literal: true
if next_video && can?(:attempt, next_video) && current_course_user
  submission = next_video.submissions.select { |s| s.creator == current_user }.first
  if submission
    json.watchNextVideoUrl edit_course_video_submission_path(current_course, next_video, submission)
  else
    json.watchNextVideoUrl course_video_attempt_path(current_course, next_video)
  end
end
