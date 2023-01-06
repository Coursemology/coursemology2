# frozen_string_literal: true
course_videos = current_course.videos
has_course_videos = course_videos.exists?
course_video_count = has_course_videos ? course_videos.count : 0
can_analyze_videos = can?(:analyze_videos, current_course)
is_course_gamified = current_course.gamified?
no_group_managers = @service.no_group_managers?

json.metadata do
  json.isCourseGamified is_course_gamified
  json.showVideo has_course_videos && can_analyze_videos
  json.courseVideoCount course_video_count
  json.hasGroupManagers !no_group_managers
end

json.students @all_students do |student|
  json.name student.name
  json.nameLink course_user_path(current_course, student)
  json.studentType student.phantom? ? 'Phantom' : 'Normal'

  unless no_group_managers
    json.groupManagers @service.group_managers_of(student) do |manager|
      json.id manager.id
      json.name manager.name
      json.nameLink course_user_path(current_course, manager)
    end
  end

  if is_course_gamified
    json.level student.level_number
    json.experiencePoints student.experience_points
    json.experiencePointsLink course_user_experience_points_records_path(current_course, student)
  end
  if has_course_videos && can_analyze_videos
    json.videoSubmissionCount student.video_submission_count
    json.videoSubmissionLink course_user_video_submissions_path(current_course, student)
    json.videoPercentWatched student.video_percent_watched
  end
end
