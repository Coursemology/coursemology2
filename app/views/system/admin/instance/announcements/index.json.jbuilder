# frozen_string_literal: true

json.announcements @announcements do |announcement|
  json.partial! 'course/announcements/announcement_list_data', announcement: announcement
end

json.permissions do
  json.canCreateAnnouncement can?(:create, Instance::Announcement.new)
end
