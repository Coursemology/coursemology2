json.(question, :id, :description, :required, :question_type, :max_options, :min_options, :weight)
json.options do
  json.array! question.options, partial: 'course/survey/questions/option', as: :option
end
