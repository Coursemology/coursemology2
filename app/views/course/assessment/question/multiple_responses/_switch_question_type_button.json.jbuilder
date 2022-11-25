# frozen_string_literal: true
is_mcq = question.multiple_choice?
json.mcqMrqType is_mcq ? 'mcq' : 'mrq'

if new_question
  json.convertUrl new_course_assessment_question_multiple_response_path(current_course, assessment, {
    multiple_choice: !is_mcq
  })
else
  has_answers = question.answers.exists?
  json.hasAnswers has_answers

  json.convertUrl url_for([current_course, assessment, question, multiple_choice: !is_mcq, unsubmit: false])
  json.unsubmitAndConvertUrl url_for([current_course, assessment, question, multiple_choice: !is_mcq]) if has_answers
end
