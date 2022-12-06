# frozen_string_literal: true
has_personalized_timeline = current_course.show_personalized_timeline_features?
is_course_gamified = current_course.gamified?
course_videos = current_course.videos
course_video_count = course_videos.exists? ? course_videos.count : 0
show_video = course_videos.exists? && can?(:analyze_videos, current_course)
no_group_managers = @service.no_group_managers?

json.hasPersonalizedTimeline has_personalized_timeline
json.isCourseGamified is_course_gamified
json.showVideo show_video
json.courseVideoCount course_video_count
json.hasGroupManagers !no_group_managers

json.students @students do |student|
  json.id student.id
  json.name student.name
  json.nameLink json.nameLink course_user_path(current_course, student)
  json.isPhantom student.phantom?
  json.numSubmissions student.assessment_submission_count
  json.correctness @correctness_hash[student.id]

  json.learningRate student.latest_learning_rate if has_personalized_timeline

  unless no_group_managers
    json.groupManagers @service.group_managers_of(student) do |manager|
      json.id manager.id
      json.name manager.name
      json.nameLink course_user_path(current_course, manager)
    end
  end

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
