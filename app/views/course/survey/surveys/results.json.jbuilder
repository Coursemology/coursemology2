json.sections @sections do |section|
  json.(section, :id, :title, :weight)
  json.description format_html(section.description)

  json.questions section.questions do |question|
    json.(question, :id, :required, :question_type, :max_options, :min_options, :weight,
          :grid_view)
    json.description format_html(question.description)
    json.options question.options, partial: 'course/survey/questions/option', as: :option

    student_submitted_answers = question.answers.select do |answer|
      answer.response.submitted? && answer.response.course_user.student?
    end
    json.answers student_submitted_answers do |answer|
      json.(answer, :id)
      unless @survey.anonymous?
        json.response_path course_survey_response_path(current_course, @survey, answer.response)
        json.course_user_name answer.response.course_user.name
        json.course_user_id answer.response.course_user.id
      end
      json.phantom answer.response.course_user.phantom?
      if question.text?
        json.(answer, :text_response)
      else
        json.(answer, :question_option_ids)
      end
    end
  end
end
json.survey do
  json.partial! 'survey', survey: @survey
end
