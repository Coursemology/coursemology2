json.form_data do
  json.method 'PATCH'
  json.auth_token form_authenticity_token
  json.path course_assessment_question_programming_path(current_course, @assessment, @programming_question)
  json.async true
end

json.partial! 'props'
