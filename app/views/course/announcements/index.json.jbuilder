# frozen_string_literal: true

json.announcements @announcements do |announcement|
  json.partial! 'announcements/announcement_list_data',
                announcement: announcement,
                course_user: @course_users_hash[announcement.creator_id]
end

json.permissions do
  json.canCreate can?(:create, Course::Announcement.new(course: current_course))
end
