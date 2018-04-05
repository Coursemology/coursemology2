# frozen_string_literal: true
module Course::Video::UrlConcern
  extend ActiveSupport::Concern

  included do
    before_validation :convert_to_embedded_url, if: :url_changed?
  end

  # Current format captures youtube's video_id for various urls.
  YOUTUBE_FORMAT = [
    %r{(?:https?://)?youtu\.be/(.+)},
    %r{(?:https?://)?(?:www\.)?youtube\.com/watch\?v=(.*?)(&|#|$)},
    %r{(?:https?://)?(?:www\.)?youtube\.com/embed/(.*?)(\?|$)},
    %r{(?:https?://)?(?:www\.)?youtube\.com/v/(.*?)(#|\?|$)}
  ].freeze

  private

  # Changes the provided youtube URL to an embedded URL for display of videos.
  def convert_to_embedded_url
    youtube_id = youtube_video_id_from_link(url)
    self.url = youtube_embedded_url(youtube_id) if youtube_id
  end

  # Default embedded youtube url for rendering in an iframe.
  def youtube_embedded_url(video_id)
    "https://www.youtube.com/embed/#{video_id}"
  end

  # Extracts the video ID from the yout
  def youtube_video_id_from_link(url)
    url.strip!
    YOUTUBE_FORMAT.find { |format| url =~ format } && Regexp.last_match(1)
    errors.add(:url, :invalid_url) unless Regexp.last_match(1)
    Regexp.last_match(1)
  end
end
