json.(post, :id, :title, :text)
json.formattedText format_html(simple_format(post.text))
creator = post.creator
json.creator do
  json.name creator.name
  json.avatar creator.profile_photo.medium.url || image_url('user_silhouette.svg')
end
json.createdAt post.created_at
json.topicId post.topic_id
json.canUpdate can?(:update, post)
json.canDestroy can?(:destroy, post)
