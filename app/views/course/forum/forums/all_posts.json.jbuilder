# frozen_string_literal: true
json.forumTopicPostPacks @forum_topic_posts do |forum, topic_posts|
  json.course do
    json.id @course_id
  end

  json.forum do
    json.id forum.id
    json.name forum.name
  end

  json.topicPostPacks topic_posts do |topic, posts|
    json.topic do
      json.id topic.id
      json.title topic.title
    end

    json.postPacks posts do |post|
      json.corePost do
        json.id post.id
        json.text post.text
        json.creatorId post.creator.id
        json.userName post.creator&.name
        if post.creator.profile_photo.medium.url.nil?
          json.avatar image_path('user_silhouette.svg')
        else
          json.avatar image_path(post.creator.profile_photo.medium.url)
        end
      end
      if post.parent_id
        json.parentPost do
          json.id post.parent.id
          json.text post.parent.text
          json.creatorId post.parent.creator.id
          json.userName post.parent.creator&.name
          if post.parent.creator.profile_photo.medium.url.nil?
            json.avatar image_path('user_silhouette.svg')
          else
            json.avatar image_path(post.parent.creator.profile_photo.medium.url)
          end
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
