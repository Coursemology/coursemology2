# frozen_string_literal: true
is_course_gamified = current_course.gamified?
no_group_managers = @service.no_group_managers?

json.isCourseGamified is_course_gamified
json.hasGroupManagers !no_group_managers

json.students @students do |student|
  json.name student.name
  json.isPhantom student.phantom?
  json.groupManagers @service.group_managers_of(student).map(&:name).join(', ') unless no_group_managers
  if is_course_gamified
    json.level student.level_number
    json.experiencePoints student.experience_points
    json.experiencePointsLink course_user_experience_points_records_path(current_course, student)
  end

  json.assessments @assessment_scores_hash[student.id]
end

json.assessments @assessments.map do |id, title, start_at|
  json.id id
  json.title title
  json.startAt start_at.iso8601
end
