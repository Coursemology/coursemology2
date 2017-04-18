responses = @responses.map { |r| [r.course_user_id, r] }.to_h
json.responses @course_students do |student|
  response = responses[student.id]
  canReadAnswers = response.present? && can?(:read_answers, response)

  json.course_user do
    json.(student, :id, :name)
    json.phantom student.phantom?
    json.path course_user_path(current_course, student)
  end

  json.present !!response
  if response
    json.(response, :id, :submitted_at)
    json.canUnsubmit can?(:unsubmit, response)
    json.path course_survey_response_path(current_course, @survey, response) if canReadAnswers
  end
end
json.survey do
  json.partial! 'survey', survey: @survey
end
