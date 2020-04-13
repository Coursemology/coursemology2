# frozen_string_literal: true
answer_ids_hash = answers.map do |a|
  [a.question_id, a]
end.to_h

topic_ids_hash = submission.submission_questions.where(question: submission.questions).map do |sq|
  [sq.question_id, sq.discussion_topic.id]
end.to_h

question_assessments = Course::QuestionAssessment.where(question: submission.questions, assessment: submission.assessment)
json.questions question_assessments.each_with_index.to_a do |(question_assessment, index)|
  question = question_assessment.question
  answer = answer_ids_hash[question.id]
  answerId = answer&.id
  submissionQuestion = question.submission_questions.from_submission(submission.id)
  json.partial! 'question', question: question, can_grade: can_grade, answer: answer
  json.displayTitle question_assessment.display_title(index+1)

  json.answerId answerId
  json.topicId topic_ids_hash[question.id]
  json.submissionQuestionId submissionQuestion.id
end
