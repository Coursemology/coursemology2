# frozen_string_literal: true
question = @voice_response_question
question_assessment = @question_assessment

json.partial! 'form', locals: {
  question: question,
  question_assessment: question_assessment,
  new_question: false,
  course: current_course
}

json.question do
  json.partial! 'course/assessment/question/form', question: question
  json.skillIds question_assessment.skill_ids
end
