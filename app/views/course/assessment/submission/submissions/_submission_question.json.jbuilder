submission_questions_hash = submission.submission_questions
  .map { |submission_questions| [submission_questions.question_id, submission_questions] }.to_h

json.topics submission.assessment.questions do |question|
  submission_question = submission_questions_hash[question.id]

  if submission_question
    topic = submission_question.discussion_topic
    json.id topic.id
    json.posts topic.posts do |post|
      json.(post, :id, :title, :text)
      json.creator post.creator.name
      json.createdAt post.created_at
    end
  end
end
