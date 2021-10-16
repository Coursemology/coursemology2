# frozen_string_literal: true
json.forumTopicPostpacks @forum_topic_posts do |forum, topic_posts|
  json.course do
    json.id @course_id
  end

  json.forum do
    json.id forum.id
    json.name forum.name
  end

  json.topicPostpacks topic_posts do |topic, posts|
    json.topic do
      json.id topic.id
      json.title topic.title
    end

    json.postpacks posts do |post|
      json.corePost do
        json.id post.id
        json.text post.text
        json.creatorId post.creator.id
        json.userName post.creator&.name
        json.avatar post.creator.profile_photo.medium.url.nil? \
          ? image_path('user_silhouette.svg') \
          : image_path(post.creator.profile_photo.medium.url)
        json.updatedAt format_datetime(post.updated_at)
      end
      if post.parent_id
        json.parentPost do
          json.id post.parent.id
          json.text post.parent.text
          json.creatorId post.parent.creator.id
          json.userName post.parent.creator&.name
          json.avatar post.parent.creator.profile_photo.medium.url.nil? \
            ? image_path('user_silhouette.svg') \
            : image_path(post.parent.creator.profile_photo.medium.url)
          json.updatedAt format_datetime(post.parent.updated_at)
        end
      end

      json.topic do
        json.id topic.id
        json.title topic.title
      end

      json.forum do
        json.id forum.id
        json.name forum.name
      end
    end
  end
end
