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
  json.options answer.options.includes(:question_option), partial: 'option', as: :option
else
  json.present false
end
