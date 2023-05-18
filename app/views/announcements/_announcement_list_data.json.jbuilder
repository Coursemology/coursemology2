# frozen_string_literal: true

json.id announcement.id
json.title announcement.title
json.content format_ckeditor_rich_text(announcement.content)
json.startTime announcement.start_at
json.endTime announcement.end_at

user_or_course_user = local_assigns[:course_user] || announcement.creator

json.creator do
  json.id user_or_course_user.id
  json.name user_or_course_user.name
  json.userUrl url_to_user_or_course_user(@course, user_or_course_user)
end

json.isUnread announcement.unread?(current_user)
json.isSticky announcement.sticky?
json.isCurrentlyActive announcement.currently_active?

json.permissions do
  json.canEdit can?(:edit, announcement)
  json.canDelete can?(:destroy, announcement)
end
