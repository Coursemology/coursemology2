# frozen_string_literal: true
question = @multiple_response_question
question_assessment = @question_assessment
allow_randomization = current_course.allow_mrq_options_randomization

json.partial! 'form', locals: {
  question: question,
  question_assessment: question_assessment,
  allow_randomization: allow_randomization,
  new_question: false,
  course: current_course
}

json.question do
  json.partial! 'course/assessment/question/form', locals: {
    question: question,
    question_assessment: question_assessment
  }
  json.skipGrading question.skip_grading
  json.randomizeOptions question.randomize_options if allow_randomization
end
