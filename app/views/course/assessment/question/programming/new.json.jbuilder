json.form_data do
  json.method 'POST'
  json.auth_token form_authenticity_token
  json.path course_assessment_question_programming_index_path(current_course, @assessment)
  json.async false
end

json.partial! 'props'
