# frozen_string_literal: true
json.topicCount @topic_count

json.topicList @topics.map(&:specific) do |topic|
  render_topic = true

  render_topic = false if current_course_user&.student? && topic.posts.only_published_posts.empty?

  if render_topic
    actable = topic.actable
    case actable
    when Course::Assessment::SubmissionQuestion
      json.partial! 'discussion_topic_submission_question', submission_question: topic
    when Course::Assessment::Answer::ProgrammingFileAnnotation
      json.partial! 'discussion_topic_programming_file_annotation', file_annotation: topic
    when Course::Video::Topic
      json.partial! 'discussion_topic_video', video_topic: topic
    end
  end
end
