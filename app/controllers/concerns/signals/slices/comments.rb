# frozen_string_literal: true
module Signals::Slices::Comments
  include Course::UnreadCountsConcern

  def generate_sync
    { discussion_topics: unread_comments_count }
  end
end
