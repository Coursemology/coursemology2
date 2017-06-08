json.topics submission.submission_questions do |submission_question|
  topic = submission_question.discussion_topic
  json.id topic.id
  json.submissionQuestionId submission_question.id
  json.questionId submission_question.question_id
  json.postIds topic.post_ids
end

programming_answers = submission.answers.select do |answer|
  answer.actable_type == Course::Assessment::Answer::Programming.name
end.map(&:specific)

json.annotations programming_answers.flat_map(&:files) do |file|
  json.fileId file.id
  json.topics file.annotations do |annotation|
    topic = annotation.discussion_topic
    json.id topic.id
    json.annotationId annotation.id
    json.postIds topic.post_ids
    json.line annotation.line
  end
end

posts = submission.submission_questions.map(&:discussion_topic).flat_map(&:posts)
posts += programming_answers.flat_map(&:files).flat_map(&:annotations).map(&:discussion_topic).flat_map(&:posts)

json.posts posts do |post|
  json.partial! post, post: post
end
