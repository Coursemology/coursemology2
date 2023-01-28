# frozen_string_literal: true
is_anonymous, show_creator = post_anonymous?(post)

json.isAnonymous is_anonymous
json.createdAt post.created_at

if show_creator
  json.creator do
    creator = post.creator
    user = @course_users_hash&.fetch(creator.id, creator) || creator
    json.id user.id
    json.userUrl url_to_user_or_course_user(current_course, user)
    json.name display_user(user)
    json.imageUrl user_image(creator)
  end
end

json.permissions do
  json.canViewAnonymous can?(:view_anonymous, post)
end
