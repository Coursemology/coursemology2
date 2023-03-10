# frozen_string_literal: true
question = @forum_post_response_question
question_assessment = @question_assessment

json.partial! 'form', locals: {
  course: current_course
}

json.question do
  json.partial! 'course/assessment/question/form', question: question
  json.hasTextResponse question.has_text_response
  json.maxPosts question.max_posts
  json.skillIds question_assessment.skill_ids
end