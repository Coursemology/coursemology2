# frozen_string_literal: true
module Signals::Slices::Announcements
  include Course::UnreadCountsConcern

  def generate_sync_for_announcements
    { announcements: unread_announcements_count }
  end
end
