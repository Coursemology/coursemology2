json.(question, :id, :description, :required, :question_type, :max_options, :min_options, :weight,
      :grid_view)
json.canUpdate can?(:update, question)
json.canDelete can?(:destroy, question)
json.options do
  json.array! question.options.includes(:attachment_references).order(weight: :asc),
              partial: 'course/survey/questions/option', as: :option
end
