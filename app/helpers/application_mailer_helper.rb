# frozen_string_literal: true
# Helpers for use in mailers.
module ApplicationMailerHelper
  # Creates a plain text link.
  #
  # @param [string] text The text to display
  # @param [string] url The URL to link to
  def plain_link_to(text, url)
    t('common.plain_text_link', text: text, url: url)
  end
end
