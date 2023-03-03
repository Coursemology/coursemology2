# frozen_string_literal: true
json.partial! 'form', locals: {
  question: @voice_response_question,
  question_assessment: @question_assessment,
  new_question: true,
  course: current_course
}
