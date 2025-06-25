# frozen_string_literal: true
json.array! @get_help_data do |data|
  assessment_question = @assessment_question_hash[[data.assessment_id, data.question_id]]
  course_id = assessment_question[:course_id]
  course_user = @course_user_hash[course_id]&.[](data.submission_creator_id)
  instance = @course_instance_hash[course_id]

  json.id data.id
  json.userId data.submission_creator_id
  json.courseUserId course_user&.id
  json.submissionId data.submission_id
  json.assessmentId data.assessment_id
  json.questionId data.question_id
  json.courseId course_id
  json.instanceId instance[:instance_id]

  json.name course_user&.name
  json.nameLink course_user_path(course_id, course_user)

  json.messageCount data.message_count
  json.lastMessage data.content
  json.questionNumber assessment_question[:question_number]
  json.questionTitle assessment_question[:question_title]
  json.assessmentTitle assessment_question[:assessment_title]
  json.courseTitle assessment_question[:course_title]
  json.instanceTitle instance[:instance_title]
  json.instanceHost instance[:instance_host]
  json.createdAt data.created_at.iso8601
end
