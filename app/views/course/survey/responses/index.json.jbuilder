responses = @responses.map { |r| [r.course_user_id, r] }.to_h
json.responses @course_students do |student|
  json.course_user do
    json.(student, :id, :name)
    json.phantom student.phantom?
    json.path course_user_path(current_course, student)
  end
  response = responses[student.id]
  json.started !!response
  if response
    json.(response, :submitted_at)
    json.path course_survey_response_path(current_course, @survey, response)
  end
end
json.survey do
  json.partial! 'survey', survey: @survey
end
