answer = @answers_hash[question.id]

json.question do
  json.(question, :id, :description, :required, :question_type, :max_options, :min_options,
        :weight, :grid_view)
  json.options question.options.includes(attachment_references: :attachment),
               partial: 'course/survey/questions/option', as: :option
end

if answer
  json.present true
  json.(answer, :id, :question_id, :text_response)
  answer_options = answer.options.includes(:question_option)
  json.options answer_options, partial: 'option', as: :option

  if answer.question.multiple_choice?
    selected_option = answer_options.find(&:selected)
    json.selected_option selected_option && selected_option.question_option_id
  end
else
  json.present false
end
