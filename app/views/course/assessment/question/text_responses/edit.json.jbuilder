# frozen_string_literal: true
question = @text_response_question
question_assessment = @question_assessment
assessment = @assessment

json.partial! 'form', locals: {
  course: current_course,
  question: question,
  assessment: assessment
}

json.question do
  json.partial! 'course/assessment/question/form', locals: {
    question: question,
    question_assessment: question_assessment
  }
  json.attachmentType @text_response_question.attachment_type
  json.requireAttachment @text_response_question.require_attachment
  json.hideText @text_response_question.hide_text
end
