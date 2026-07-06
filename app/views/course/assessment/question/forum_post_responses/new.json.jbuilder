# frozen_string_literal: true
json.partial! 'form', locals: {
  course: current_course,
  question: @forum_post_response_question
}
