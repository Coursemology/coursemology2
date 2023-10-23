# frozen_string_literal: true
module Signals::Slices::Forums
  include Course::UnreadCountsConcern

  def generate_sync_for_forums
    { forums: unread_forum_topics_count }
  end
end
