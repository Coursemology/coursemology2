# frozen_string_literal: true
json.assessments @assessment_info_array do |assessment|
  json.id assessment[0]
  json.title assessment[1]
  json.startAt assessment[2].iso8601
  json.endAt assessment[3]&.iso8601
end

json.submissions @user_submission_array do |user|
  json.id user[0]
  json.name user[1]
  json.isPhantom user[2]
  json.submissions user[3] do |submission|
    json.assessmentId submission[0]
    json.submittedAt submission[1].iso8601
  end
end
