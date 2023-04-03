# frozen_string_literal: true

json.announcements @announcements do |announcement|
  json.partial! 'announcements/announcement_list_data', announcement: announcement
end

json.permissions do
  json.canCreate can?(:create, Course::Announcement.new(course: current_course))
end
