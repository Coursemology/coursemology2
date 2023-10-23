# frozen_string_literal: true
module Signals::Slices::Videos
  include Course::UnreadCountsConcern

  def generate_sync_for_videos
    { videos: unwatched_videos_count }
  end
end
