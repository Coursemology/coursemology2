# frozen_string_literal: true
module Signals::Slices::Videos
  include Course::UnreadCountsConcern

  def generate_sync
    { videos: unwatched_videos_count }
  end
end
