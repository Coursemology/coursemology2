# frozen_string_literal: true
my_students_set = Set.new(@my_students.map(&:id))
responses = @responses.to_h { |r| [r.course_user_id, r] }
json.responses @course_users do |course_user|
  response = responses[course_user.id]
  can_read_answers = response.present? && can?(:read_answers, response)

  json.course_user do
    json.(course_user, :id, :name)
    json.phantom course_user.phantom?
    json.path course_user_path(current_course, course_user)
    json.isStudent course_user.student?
    json.myStudent my_students_set.include?(course_user.id) if course_user.student?
  end

  json.present !response.nil?
  if response
    json.id response.id
    json.submitted_at response.submitted_at&.iso8601
    json.updated_at response.updated_at&.iso8601
    json.canUnsubmit can?(:unsubmit, response)
    json.path course_survey_response_path(current_course, @survey, response) if can_read_answers
  end
end
json.survey do
  survey_time = @survey.time_for(current_course_user)
  json.partial! 'course/survey/surveys/survey', survey: @survey, survey_time: survey_time
end
