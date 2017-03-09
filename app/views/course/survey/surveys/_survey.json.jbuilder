current_user_response = survey.responses.find_by(creator: current_user)

json.(survey, :id, :title, :description, :start_at, :end_at, :base_exp, :published)
json.isStarted current_user_response.present?
json.responseId current_user_response && current_user_response.id
json.submitted_at current_user_response && current_user_response.submitted_at
json.canUpdate can?(:update, survey)
json.canDelete can?(:destroy, survey)
json.canCreateSection can?(:create, Course::Survey::Section.new(survey: survey))
json.canViewResults can?(:manage, survey)
