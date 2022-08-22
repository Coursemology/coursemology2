# frozen_string_literal: true
codaveri_feedback = post.codaveri_feedback

json.(post, :id, :title, :text)
json.formattedText format_ckeditor_rich_text(simple_format(post.text))
json.creator do
  creator = post.creator
  user = @course_users_hash&.fetch(creator.id, creator) || creator
  json.id user.id
  json.userUrl url_to_user_or_course_user(current_course, user)
  json.name display_user(user)
  if codaveri_feedback && (codaveri_feedback.status == 'pending_review')
    json.name 'Codaveri (Automated Feedback)'
  else
    json.name post.author_name
  end
  json.imageUrl creator.profile_photo.medium.url || image_url('user_silhouette.svg')
end
json.createdAt post.created_at&.iso8601
json.topicId post.topic_id
json.canUpdate can?(:update, post)
json.canDestroy can?(:destroy, post)
json.isDelayed post.delayed?

if codaveri_feedback && codaveri_feedback.status == 'pending_review'
  json.codaveriFeedback do
    json.id codaveri_feedback.id
    json.status codaveri_feedback.status
    json.originalFeedback codaveri_feedback.original_feedback
    json.rating codaveri_feedback.rating
  end
end
