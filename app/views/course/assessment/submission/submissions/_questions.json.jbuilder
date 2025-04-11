# frozen_string_literal: true
answer_ids_hash = answers.to_h do |a|
  [a.question_id, a]
end

sq_topic_ids_hash = submission_questions.to_h do |sq|
  [sq.question_id, [sq, sq.discussion_topic.id]]
end

question_assessments = Course::QuestionAssessment.
                       where(question: submission.questions, assessment: assessment).
                       with_question_actables

json.questions question_assessments.each_with_index.to_a do |(question_assessment, index)|
  question = question_assessment.question
  answer = answer_ids_hash[question.id]
  answer_id = answer&.id
  submission_question = sq_topic_ids_hash[question.id][0]
  json.partial! 'question', question: question, can_grade: can_grade, answer: answer
  json.questionNumber index + 1
  json.questionTitle question.title

  json.answerId answer_id
  json.topicId sq_topic_ids_hash[question.id][1]
  json.submissionQuestionId submission_question.id
end
