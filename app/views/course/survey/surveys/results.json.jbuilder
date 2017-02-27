json.questions do
  json.array! @questions do |question|
    @question_options = question.options
    json.partial! 'course/survey/questions/question', question: question
    json.answers do
      submitted_answers = question.answers.select { |answer| answer.response.submitted? }
      json.array! submitted_answers do |answer|
        json.(answer, :id)
        json.course_user_name answer.response.course_user.name
        json.course_user_role answer.response.course_user.role
        if question.text?
          json.(answer, :text_response)
        else
          json.selected_options answer.options.select(&:selected).map(&:question_option_id)
        end
      end
    end
  end
end
json.survey do
  json.partial! 'survey', survey: @survey
end
