# frozen_string_literal: true
json.partial! 'course/assessment/question/skills', course: course

json.allowRandomization allow_randomization

json.partial! 'multiple_response_details', locals: {
  assessment: question_assessment.assessment,
  question: question,
  new_question: new_question,
  full_options: !new_question
}
