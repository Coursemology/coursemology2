grouped_answers = response.answers.group_by { |answer| answer.question.section_id }
response_creator_name = response.creator

json.survey do
  json.(survey, :id, :title, :description, :start_at, :end_at, :base_exp, :published)
end

json.response do
  json.(response, :id, :submitted_at)
  json.creator_name response.creator.name
  json.sections survey.sections do |section|
    json.(section, :id, :title, :description, :weight)
    json.answers grouped_answers[section.id], partial: 'answer', as: :answer
  end
end

json.canUnsubmit can?(:manage, @survey)
json.isResponseCreator current_user.id == @response.creator_id
