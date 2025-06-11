# frozen_string_literal: true
json.liveFeedbacks @live_feedbacks do |feedback|
  course_user = @course_user_hash[feedback.submission_creator_id]

  json.id feedback.id
  json.userId course_user&.id
  json.submissionId feedback.submission_id
  json.assessmentId feedback.assessment_id
  json.questionId feedback.question_id

  json.name course_user&.name
  json.nameLink course_user_path(current_course, course_user)

  json.lastMessage feedback.content
  json.messageCount feedback.message_count
  json.questionNumber @assessment_question_hash[[feedback.assessment_id, feedback.question_id]][:question_number]
  json.questionTitle @assessment_question_hash[[feedback.assessment_id, feedback.question_id]][:question_title]
  json.assessmentTitle @assessment_question_hash[[feedback.assessment_id, feedback.question_id]][:assessment_title]

  json.createdAt feedback.created_at&.iso8601
end
