# frozen_string_literal: true
if next_video && can?(:attempt, next_video) && current_course_user
  submission = next_video.submissions.select { |s| s.creator == current_user }.first
  if submission
    json.watchNextVideoUrl edit_course_video_submission_path(current_course, next_video, submission)
    json.nextVideoSubmissionExists true
  else
    json.watchNextVideoUrl course_video_submissions_path(current_course, next_video)
    json.nextVideoSubmissionExists false
  end
end
