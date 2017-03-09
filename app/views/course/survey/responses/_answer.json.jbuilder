json.(answer, :id, :question_id, :text_response)
json.question do
  json.(answer.question, :id, :description, :required, :question_type, :max_options, :min_options,
        :weight, :grid_view)
  json.options answer.question.options.includes(attachment_references: :attachment),
               partial: 'course/survey/questions/option', as: :option
end

json.options answer.options.includes(:question_option), partial: 'option', as: :option
