# frozen_string_literal: true
json.forumTopicPosts @forum_topic_posts do |forum, topic_posts|
  json.course do
    json.id @course_id
  end

  json.forum do
    json.id forum.id
    json.name forum.name
  end

  json.topicPosts topic_posts do |topic, posts|
    json.topic do
      json.id topic.id
      json.title topic.title
    end

    json.posts posts do |post|
      json.post do
        json.id post.id
        json.text post.text
        json.userName post.creator&.name
        json.avatar post.creator.profile_photo.medium.url.nil? \
          ? image_path('user_silhouette.svg') \
          : image_path(post.creator.profile_photo.medium.url)
        json.updatedAt format_datetime(post.updated_at)
      end
      if post.parent_id
        json.parent do
          json.id post.parent.id
          json.text post.parent.text
          json.userName post.parent.creator&.name
          json.avatar post.parent.creator.profile_photo.medium.url.nil? \
            ? image_path('user_silhouette.svg') \
            : image_path(post.parent.creator.profile_photo.medium.url)
          json.updatedAt format_datetime(post.parent.updated_at)
        end
      end
    end
  end
end
