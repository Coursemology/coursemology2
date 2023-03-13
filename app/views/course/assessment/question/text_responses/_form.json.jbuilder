# frozen_string_literal: true
json.partial! 'course/assessment/question/skills', course: course

json.allowAttachment question.allow_attachment? unless question.hide_text?

if !question.file_upload_question?
  json.partial! 'solution_details', question: question
end