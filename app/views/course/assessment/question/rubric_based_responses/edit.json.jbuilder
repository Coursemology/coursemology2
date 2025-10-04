# frozen_string_literal: true
question = @rubric_based_response_question
question_assessment = @question_assessment
assessment = @assessment

json.partial! 'form', locals: {
  course: current_course,
  question: question,
  assessment: assessment
}

json.parentQuestionId question.acting_as.id

json.question do
  json.partial! 'course/assessment/question/form', locals: {
    question: question,
    question_assessment: question_assessment
  }
end
