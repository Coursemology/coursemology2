# frozen_string_literal: true
my_students_set = Set.new(@my_students.map(&:id))
json.sections @sections do |section|
  json.(section, :id, :title, :weight)
  json.description format_ckeditor_rich_text(section.description)

  json.questions section.questions do |question|
    json.(question, :id, :required, :question_type, :max_options, :min_options, :weight,
          :grid_view)
    json.description format_ckeditor_rich_text(question.description)
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
      json.myStudent my_students_set.include?(answer.response.course_user.id) if answer.response.course_user.student?
      json.isStudent answer.response.course_user.student?
      if question.text?
        json.(answer, :text_response)
      else
        json.question_option_ids answer.options.pluck(:question_option_id)
      end
    end
  end
end
json.survey do
  survey_time = @survey.time_for(current_course_user)
  json.partial! 'survey', survey: @survey, survey_time: survey_time
end
