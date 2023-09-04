# frozen_string_literal: true
module Signals::Slices::Announcements
  include Course::UnreadCountsConcern

  def generate_sync
    { announcements: unread_announcements_count }
  end
end
