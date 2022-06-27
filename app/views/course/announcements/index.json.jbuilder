# frozen_string_literal: true

json.announcements @announcements do |announcement|
  json.partial! 'announcement_list_data', announcement: announcement
end

json.permissions do
  json.canCreate can?(:create, Course::Announcement.new(course: current_course))
end
