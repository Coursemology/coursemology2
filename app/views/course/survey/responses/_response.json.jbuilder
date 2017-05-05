@answers_hash = response.answers.map { |answer| [answer.question_id, answer] }.to_h

json.survey do
  json.(survey, :id, :title, :start_at, :end_at, :base_exp, :published)
  json.description format_html(survey.description)
end

json.response do
  json.(response, :id, :submitted_at)
  json.creator_name response.creator.name
  json.sections survey.sections do |section|
    json.(section, :id, :title, :weight)
    json.description format_html(section.description)
    json.answers section.questions, partial: 'answer', as: :question
  end
end

json.flags do
  json.canModify can?(:modify, @response)
  json.canSubmit can?(:submit, @response)
  json.canUnsubmit can?(:unsubmit, @response)
  json.isResponseCreator current_user.id == @response.creator_id
end
