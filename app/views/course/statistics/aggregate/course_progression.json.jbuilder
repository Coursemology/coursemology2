# frozen_string_literal: true
json.assessments @assessment_info_array do |(id, title, start_at, end_at)|
  json.id id
  json.title title
  json.startAt start_at.iso8601
  json.endAt end_at&.iso8601
end

json.submissions @user_submission_array do |(id, name, is_phantom, submissions)|
  json.id id
  json.name name
  json.isPhantom is_phantom
  json.submissions submissions do |(assessment_id, submitted_at)|
    json.assessmentId assessment_id
    json.submittedAt submitted_at.iso8601
  end
end
