# frozen_string_literal: true
json.assessments @assessment_info_array do |(id, title, startAt, endAt)|
  json.id id
  json.title title
  json.startAt startAt.iso8601
  json.endAt endAt&.iso8601
end

json.submissions @user_submission_array do |(id, name, isPhantom, submissions)|
  json.id id
  json.name name
  json.isPhantom isPhantom
  json.submissions submissions do |(assessmentId, submittedAt)|
    json.assessmentId assessmentId
    json.submittedAt submittedAt.iso8601
  end
end
