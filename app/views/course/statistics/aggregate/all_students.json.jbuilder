# frozen_string_literal: true
course_videos = current_course.videos
has_course_videos = course_videos.exists?
course_video_count = has_course_videos ? course_videos.count : 0
can_analyze_videos = can?(:analyze_videos, current_course)
is_course_gamified = current_course.gamified?
no_group_managers = @service.no_group_managers?
has_my_students = false

json.students @all_students do |student|
  is_my_student = false
  json.id student.id
  json.name student.name
  json.nameLink course_user_path(current_course, student)
  json.studentType student.phantom? ? 'Phantom' : 'Normal'

  unless no_group_managers
    json.groupManagers @service.group_managers_of(student) do |manager|
      if manager.id == current_course_user&.id
        is_my_student = true
        has_my_students = true
      end

      json.id manager.id
      json.name manager.name
      json.nameLink course_user_path(current_course, manager)
    end
  end

  json.isMyStudent is_my_student

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

json.metadata do
  json.isCourseGamified is_course_gamified
  json.showVideo has_course_videos && can_analyze_videos
  json.courseVideoCount course_video_count
  json.hasGroupManagers !no_group_managers
  json.hasMyStudents has_my_students
  json.showRedirectToMissionControl current_course.component_enabled?(Course::StoriesComponent) &&
                                    can?(:access_mission_control, current_course)
end
