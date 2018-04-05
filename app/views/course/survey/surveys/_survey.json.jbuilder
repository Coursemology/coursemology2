# frozen_string_literal: true
json.(survey, :id, :title, :base_exp, :time_bonus_exp, :published,
              :start_at, :end_at, :closing_reminded_at,
              :anonymous, :allow_response_after_end, :allow_modify_after_submit)
json.description format_html(survey.description)

canUpdate = can?(:update, survey)
json.canUpdate canUpdate
json.canDelete can?(:destroy, survey)
json.canCreateSection can?(:create, Course::Survey::Section.new(survey: survey))
json.canViewResults can?(:manage, survey)
json.canRespond can?(:create, Course::Survey::Response.new(survey: survey))
json.hasStudentResponse survey.has_student_response? if canUpdate

current_user_response = survey.responses.find_by(creator: current_user)
if current_user_response
  json.response do
    json.(current_user_response, :id, :submitted_at)
    json.canModify can?(:modify, current_user_response)
    json.canSubmit can?(:submit, current_user_response)
  end
else
  json.response nil
end
