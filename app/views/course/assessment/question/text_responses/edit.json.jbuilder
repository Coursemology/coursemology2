# frozen_string_literal: true
question = @text_response_question
question_assessment = @question_assessment

json.partial! 'form', locals: {
  course: current_course,
  question: question
}

json.question do
  json.partial! 'course/assessment/question/form', locals: {
    question: question,
    question_assessment: question_assessment
  }
  json.allowAttachment @text_response_question.allow_attachment
  json.hideText @text_response_question.hide_text
end
