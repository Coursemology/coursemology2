# frozen_string_literal: true
json.surveys @surveys do |survey|
  json.partial! 'survey', survey: survey, survey_time: survey.time_for(current_course_user)
  json.submissionsCount @survey_submission_count_hash[survey.id]
end

json.canCreate can?(:create, Course::Survey.new(course: current_course))
json.studentsCount current_course.course_users.students.size
