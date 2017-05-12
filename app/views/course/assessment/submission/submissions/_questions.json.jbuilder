answer_ids_hash = submission.latest_answers.map do |a|
  [a.question_id, a.id]
end.to_h

topic_ids_hash = submission.submission_questions.map do |sq|
  [sq.question_id, sq.discussion_topic.id]
end.to_h

if previous_attempts
  previous_attempts_hash = previous_attempts.map { |a| [a.question_id, a.id] }.to_h
end

json.questions assessment.questions do |question|
  json.id question.id
  json.description question.description
  json.displayTitle question.display_title
  json.maximumGrade question.maximum_grade.to_f

  json.type case question.actable_type
            when Course::Assessment::Question::MultipleResponse.name
              question.actable.multiple_choice? ? 'MultipleChoice' : 'MultipleResponse'
            when Course::Assessment::Question::TextResponse.name
              question.actable.hide_text? ? 'FileUpload' : 'TextResponse'
            when Course::Assessment::Question::Programming.name
              'Programming'
            end

  json.partial! question, question: question.specific, can_grade: can_grade

  json.answerId answer_ids_hash[question.id]
  json.topicId topic_ids_hash[question.id]
  json.explanationId previous_attempts_hash[question.id] if previous_attempts
end
