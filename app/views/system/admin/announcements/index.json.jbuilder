# frozen_string_literal: true

json.announcements @announcements do |announcement|
  json.partial! 'announcements/announcement_data', announcement: announcement
end

json.permissions do
  json.canCreate can?(:create, System::Announcement.new)
end
