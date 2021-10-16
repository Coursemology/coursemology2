# frozen_string_literal: true
json.selectedPostpacks selected_posts do |selected_post|
  json.forum do
    json.id selected_post.forum_id
    json.name selected_post.forum_name
  end

  json.topic do
    json.id selected_post.forum_topic_id
    json.title selected_post.topic_title
    json.isDeleted selected_post.is_topic_deleted
  end

  json.corePost do
    json.id selected_post.post_id
    json.text selected_post.post_text
    json.creatorId selected_post.post_creator_id
    if selected_post.post_creator
      json.userName selected_post.post_creator.name
      json.avatar selected_post.post_creator.profile_photo.medium.url.nil? \
          ? image_path('user_silhouette.svg') \
          : image_path(selected_post.post_creator.profile_photo.medium.url)
    else
      json.userName 'Deleted User'
      json.avatar image_path('user_silhouette.svg')
    end
    json.updatedAt format_datetime(selected_post.post_updated_at)
    json.isUpdated selected_post.is_post_updated
    json.isDeleted selected_post.is_post_deleted
  end

  if selected_post.parent_id
    json.parentPost do
      json.id selected_post.parent_id
      json.text selected_post.parent_text
      json.creatorId selected_post.parent_creator_id
      if selected_post.parent_creator
        json.userName selected_post.parent_creator.name
        json.avatar selected_post.parent_creator.profile_photo.medium.url.nil? \
          ? image_path('user_silhouette.svg') \
          : image_path(selected_post.parent_creator.profile_photo.medium.url)
      else
        json.userName 'Deleted User'
        json.avatar image_path('user_silhouette.svg')
      end
      json.updatedAt format_datetime(selected_post.parent_updated_at)
      json.isUpdated selected_post.is_parent_updated
      json.isDeleted selected_post.is_parent_deleted
    end
  end
end
