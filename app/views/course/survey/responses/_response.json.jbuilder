grouped_answers = response.answers.group_by { |answer| answer.question.section_id }

json.survey do
  json.(survey, :id, :title, :description, :start_at, :end_at, :base_exp, :published)
end

json.response do
  json.(response, :id, :submitted_at)
  json.sections survey.sections do |section|
    json.(section, :id, :title, :description, :weight)
    json.answers grouped_answers[section.id], partial: 'answer', as: :answer
  end
end
