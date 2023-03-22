# frozen_string_literal: true
json.partial! 'form', locals: {
  course: current_course,
  question: @text_response_question,
  assessment: @assessment
}
