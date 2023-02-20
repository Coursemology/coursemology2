# frozen_string_literal: true
json.partial! 'form', locals: {
  question: @multiple_response_question,
  question_assessment: @question_assessment,
  allow_randomization: current_course.allow_mrq_options_randomization,
  new_question: true,
  course: current_course
}
