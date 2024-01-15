# frozen_string_literal: true
json.partial! 'course/assessment/question/multiple_responses/switch_question_type_button', locals: {
  assessment: assessment,
  question: question,
  new_question: new_question
}

json.type question.question_type_readable
json.gradingScheme question.grading_scheme

json.options question.options do |option|
  json.id option.id
  json.option option.option
  json.correct option.correct

  if full_options
    json.explanation option.explanation
    json.weight option.weight
    json.ignoreRandomization option.ignore_randomization
  end
end
