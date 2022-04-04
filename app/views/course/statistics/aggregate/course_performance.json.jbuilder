# frozen_string_literal: true
show_personalized_timeline = current_course.show_personalized_timeline_features?
show_video = @course_videos.exists? && can?(:analyze_videos, current_course)
is_course_gamified = current_course.gamified?

json.students @students do |student|
  json.id student.id
  json.name student.name
  json.isPhantom student.phantom?
  json.numSubmissions student.assessment_submission_count
  json.correctness @correctness_hash[student.id]

  json.learningRate student.latest_learning_rate if show_personalized_timeline

  if is_course_gamified
    json.achievementCount student.achievement_count
    json.level student.level_number
    json.experiencePoints student.experience_points
    json.experiencePointsLink course_user_experience_points_records_path(current_course, student)
  end

  if show_video
    json.videoSubmissionCount student.video_submission_count
    json.videoPercentWatched student.video_percent_watched
    json.videoSubmissionLink course_user_video_submissions_path(current_course, student)
  end
end

json.hasPersonalizedTimeline @has_personalized_timeline
json.isCourseGamified is_course_gamified
json.showVideo show_video
json.courseVideoCount @course_video_count
