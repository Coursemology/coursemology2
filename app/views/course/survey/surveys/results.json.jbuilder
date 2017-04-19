json.sections @sections do |section|
  json.(section, :id, :title, :description, :weight)
  json.questions section.questions do |question|
    json.(question, :id, :description, :required, :question_type, :max_options, :min_options, :weight,
          :grid_view)
    json.options question.options, partial: 'course/survey/questions/option', as: :option

    student_submitted_answers = question.answers.select do |answer|
      answer.response.submitted? && answer.response.course_user.student?
    end
    json.answers student_submitted_answers do |answer|
      json.(answer, :id)
      json.course_user_name answer.response.course_user.name unless @survey.anonymous?
      json.phantom answer.response.course_user.phantom?
      if question.text?
        json.(answer, :text_response)
      else
        json.selected_options answer.options.select(&:selected).map(&:question_option_id)
      end
    end
  end
end
json.survey do
  json.partial! 'survey', survey: @survey
end
