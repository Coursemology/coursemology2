# frozen_string_literal: true
module Signals::Slices::Forums
  include Course::UnreadCountsConcern

  def generate_sync
    { forums: unread_forum_topics_count }
  end
end
