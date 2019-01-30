# frozen_string_literal: true
answer_ids_hash = answers.map do |a|
  [a.question_id, a.id]
end.to_h

topic_ids_hash = submission.submission_questions.where(question: submission.questions).map do |sq|
  [sq.question_id, sq.discussion_topic.id]
end.to_h

json.questions Course::QuestionAssessment.where(question: submission.questions, assessment: submission.assessment) \
    do |question_assessment|
  question = question_assessment.question
  answerId = answer_ids_hash[question.id]
  submissionQuestion = question.submission_questions.from_submission(submission.id)
  json.partial! 'question', question: question, can_grade: can_grade
  json.displayTitle question_assessment.display_title

  json.answerId answerId
  json.topicId topic_ids_hash[question.id]
  json.submissionQuestionId submissionQuestion.id
end
