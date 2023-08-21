# frozen_string_literal: true
json.selected_post_packs selected_posts do |selected_post|
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
      json.avatar user_image(selected_post.post_creator)
    else
      json.userName 'Deleted User'
    end
    json.updatedAt selected_post.post_updated_at&.iso8601
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
        json.avatar user_image(selected_post.parent_creator)
      else
        json.userName 'Deleted User'
      end
      json.updatedAt selected_post.parent_updated_at&.iso8601
      json.isUpdated selected_post.is_parent_updated
      json.isDeleted selected_post.is_parent_deleted
    end
  end
end
