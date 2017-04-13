@answers_hash = response.answers.map { |answer| [answer.question_id, answer] }.to_h

json.survey do
  json.(survey, :id, :title, :description, :start_at, :end_at, :base_exp, :published)
end

json.response do
  json.(response, :id, :submitted_at)
  json.creator_name response.creator.name
  json.sections survey.sections do |section|
    json.(section, :id, :title, :description, :weight)
    json.answers section.questions, partial: 'answer', as: :question
  end
end

json.flags do
  json.canModify can?(:modify, @response)
  json.canSubmit can?(:submit, @response)
  json.canUnsubmit can?(:unsubmit, @response)
  json.isResponseCreator current_user.id == @response.creator_id
end
