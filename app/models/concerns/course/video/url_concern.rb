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
    %r{(?:https?://)?(?:www\.)?youtube\.com/embed/(.*?)?(\?|$)(.*?)(\?|$)},
    %r{(?:https?://)?(?:www\.)?youtube\.com/v/(.*?)(#|\?|$)}
  ].freeze

  private

  # Changes the provided youtube URL to an embedded URL for display of videos.
  def convert_to_embedded_url
    youtube_hash = youtube_hash_from_link(url)
    self.url = youtube_embedded_url(youtube_hash) if youtube_hash[:youtube_id]
  end

  # Default embedded youtube url for rendering in an iframe.
  def youtube_embedded_url(youtube_hash)
    embedded_url = "https://www.youtube.com/embed/#{youtube_hash[:youtube_id]}"
    if youtube_hash[:youtube_params]
      embedded_url + '?' + URI.encode_www_form(youtube_hash[:youtube_params].slice('start', 'end'))
    else
      embedded_url
    end
  end

  # Extracts the video ID from the yout
  def youtube_hash_from_link(url)
    result_hash = {}
    url.strip!
    YOUTUBE_FORMAT.find { |format| url =~ format } && Regexp.last_match(1)
    errors.add(:url, :invalid_url) unless Regexp.last_match(1)
    result_hash[:youtube_id] = Regexp.last_match(1)
    result_hash[:youtube_params] = URI.decode_www_form(Regexp.last_match(3)).to_h if Regexp.last_match(3)
    result_hash
  end
end
