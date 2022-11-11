# frozen_string_literal: true
responses = @responses.map { |r| [r.course_user_id, r] }.to_h
json.responses @course_students do |student|
  response = responses[student.id]
  can_read_answers = response.present? && can?(:read_answers, response)

  json.course_user do
    json.(student, :id, :name)
    json.phantom student.phantom?
    json.path course_user_path(current_course, student)
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
  json.partial! 'course/survey/surveys/survey', survey: @survey
end
