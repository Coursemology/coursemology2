# frozen_string_literal: true
json.array! @get_help_data do |data|
  course_user = @course_user_hash[data.submission_creator_id]

  json.id data.id
  json.userId course_user&.id
  json.submissionId data.submission_id
  json.assessmentId data.assessment_id
  json.questionId data.question_id

  json.name course_user&.name
  json.nameLink course_user_path(current_course, course_user)

  json.lastMessage data.content
  json.messageCount data.message_count
  json.questionNumber @assessment_question_hash[[data.assessment_id, data.question_id]][:question_number]
  json.questionTitle @assessment_question_hash[[data.assessment_id, data.question_id]][:question_title]
  json.assessmentTitle @assessment_question_hash[[data.assessment_id, data.question_id]][:assessment_title]

  json.createdAt data.created_at&.iso8601
end
