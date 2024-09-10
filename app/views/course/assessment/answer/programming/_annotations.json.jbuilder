# frozen_string_literal: true
json.annotations programming_files do |file|
  json.fileId file.id
  json.topics(file.annotations.reject { |a| a.discussion_topic.post_ids.empty? }) do |annotation|
    topic = annotation.discussion_topic
    next unless can_grade || !topic.posts.only_published_posts.empty?

    json.id topic.id
    if can_grade
      json.postIds topic.post_ids
    else
      json.postIds topic.posts.only_published_posts.ids
    end
    json.line annotation.line
  end
end
