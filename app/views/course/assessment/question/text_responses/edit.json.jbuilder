# frozen_string_literal: true
question = @text_response_question
question_assessment = @question_assessment

json.partial! 'form', locals: {
  course: current_course
  question: question
}

json.question do
  json.partial! 'course/assessment/question/form', question: question
  json.skillIds question_assessment.skill_ids
end
