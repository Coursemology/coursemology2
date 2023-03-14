# frozen_string_literal: true
json.partial! 'course/assessment/question/skills', course: course

is_file_upload = question.file_upload_question?
json.questionType is_file_upload ? 'file_upload' : 'text_response'

if !is_file_upload
  json.allowAttachment question.allow_attachment?
  json.partial! 'solution_details', question: question
end