json.survey do
  json.partial! 'course/survey/surveys/survey_with_questions', survey: survey
end

json.response do
  json.(response, :id, :submitted_at)
  json.creator_name response.creator.name

  json.answers answers do |answer|
    if answer
      json.present true
      json.(answer, :id, :question_id, :text_response, :question_option_ids)
    else
      json.present false
    end
  end
end

json.flags do
  json.canModify can?(:modify, response)
  json.canSubmit can?(:submit, response)
  json.canUnsubmit can?(:unsubmit, response)
  json.isResponseCreator current_user.id == response.creator_id
end
