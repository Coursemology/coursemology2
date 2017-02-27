json.(question, :id, :description, :required, :question_type, :max_options, :min_options, :weight,
      :grid_view)
json.canUpdate can?(:update, question)
json.canDelete can?(:destroy, question)
options = @question_options || question.options.includes(:attachment_references).order(weight: :asc)
json.options do
  json.array! options, partial: 'course/survey/questions/option', as: :option
end
