json.topics submission.submission_questions do |submission_question|
  topic = submission_question.discussion_topic
  json.id topic.id
  json.questionId submission_question.question_id
  json.posts topic.posts do |post|
    json.(post, :id, :title, :text)
    json.creator post.creator.name
    json.createdAt post.created_at
  end
end
