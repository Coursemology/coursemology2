answer_ids_hash = answers.map do |a|
  [a.question_id, a.id]
end.to_h

topic_ids_hash = submission.submission_questions.map do |sq|
  [sq.question_id, sq.discussion_topic.id]
end.to_h

json.questions assessment.question_assessments.includes(:question) do |question_assessment|
  question = question_assessment.question
  json.partial! 'question', question: question, can_grade: can_grade
  json.displayTitle question_assessment.display_title

  json.answerId answer_ids_hash[question.id]
  json.topicId topic_ids_hash[question.id]
end
