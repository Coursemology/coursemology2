# frozen_string_literal: true

json.id announcement.id
json.title announcement.title
json.content format_ckeditor_rich_text(announcement.content)
json.startTime announcement.start_at
json.endTime announcement.end_at

course_user = announcement.creator.course_users.find_by(course: controller.current_course) unless @course.nil?

if course_user
  json.courseUserId course_user.id
  json.courseUserName course_user.name
else
  creator = announcement.creator
  json.userId creator.id
  json.userName creator.name
end

json.isUnread announcement.unread?(current_user)
json.isSticky announcement.sticky?
json.isCurrentlyActive announcement.currently_active?

json.permissions do
  json.canEdit can?(:edit, announcement)
  json.canDelete can?(:destroy, announcement)
end
