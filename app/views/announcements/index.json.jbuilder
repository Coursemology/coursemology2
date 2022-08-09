# frozen_string_literal: true
json.announcements @announcements.each do |announcement|
  json.partial! 'announcement_list_data', announcement: announcement
end
