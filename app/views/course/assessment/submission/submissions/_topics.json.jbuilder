# frozen_string_literal: true
json.topics submission_questions do |submission_question|
  topic = submission_question.discussion_topic
  json.id topic.id
  json.submissionQuestionId submission_question.id
  json.questionId submission_question.question_id
  json.postIds can_grade ? topic.post_ids : topic.posts.only_published_posts.ids
end

programming_answers = submission.answers.where(question: submission.questions).
                      includes(actable: { files: { annotations: { discussion_topic: :posts } } }).
                      select do |answer|
  answer.actable_type == Course::Assessment::Answer::Programming.name
end.map(&:specific)

json.annotations programming_answers.flat_map(&:files) do |file|
  json.fileId file.id
  json.topics(file.annotations.reject { |a| a.discussion_topic.post_ids.empty? }) do |annotation|
    topic = annotation.discussion_topic
    if can_grade || !topic.posts.only_published_posts.empty?
      json.id topic.id
      json.postIds can_grade ? topic.post_ids : topic.posts.only_published_posts.ids
      json.line annotation.line
    end
  end
end

posts = submission_questions.map(&:discussion_topic).flat_map(&:posts)
posts += programming_answers.flat_map(&:files).flat_map(&:annotations).map(&:discussion_topic).flat_map(&:posts)

json.posts posts do |post|
  json.partial! post, post: post if can_grade || post.published?
end
