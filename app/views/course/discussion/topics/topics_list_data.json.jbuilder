# frozen_string_literal: true
json.topicCount @topic_count

json.topicList @topics.map(&:specific) do |topic|
  unless topic.posts.exclude_delayed_posts.empty?
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
