# frozen_string_literal: true
question = @forum_post_response_question
question_assessment = @question_assessment

json.partial! 'form', locals: {
  course: current_course,
  question: question
}

# The polymorphic question id, used by the AI-grading playground link (rubric grading only).
json.parentQuestionId question.acting_as.id

json.question do
  json.partial! 'course/assessment/question/form', locals: {
    question: question,
    question_assessment: question_assessment
  }
  json.hasTextResponse question.has_text_response
  json.maxPosts question.max_posts
end
