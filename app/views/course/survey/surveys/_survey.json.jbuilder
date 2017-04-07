current_user_response = survey.responses.find_by(creator: current_user)

json.(survey, :id, :title, :description, :base_exp, :time_bonus_exp, :published,
              :start_at, :end_at, :closing_reminded_at,
              :anonymous, :allow_response_after_end, :allow_modify_after_submit)
json.isStarted current_user_response.present?
json.responseId current_user_response && current_user_response.id
json.submitted_at current_user_response && current_user_response.submitted_at
json.canUpdate can?(:update, survey)
json.canDelete can?(:destroy, survey)
json.canCreateSection can?(:create, Course::Survey::Section.new(survey: survey))
json.canViewResults can?(:manage, survey)
