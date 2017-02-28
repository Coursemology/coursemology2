json.questions @questions do |question|
  @question_options = question.options
  json.partial! 'course/survey/questions/question', question: question
  student_submitted_answers = question.answers.select do |answer|
    answer.response.submitted? && answer.response.course_user.student?
  end
  json.answers student_submitted_answers do |answer|
    json.(answer, :id)
    json.course_user_name answer.response.course_user.name
    json.phantom answer.response.course_user.phantom?
    if question.text?
      json.(answer, :text_response)
    else
      json.selected_options answer.options.select(&:selected).map(&:question_option_id)
    end
  end
end
json.survey do
  json.partial! 'survey', survey: @survey
end
