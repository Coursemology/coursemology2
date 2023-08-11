# frozen_string_literal: true
require 'oembed'

OEmbed::Providers.register_all

# HTML iframe points to https://geo.dailymotion.com/*. Ensure this is whitelisted in the sanitizer.
# https://developers.dailymotion.com/news/player-api/embed-dailymotion-video-oembed/
DailymotionProvider = OEmbed::Provider.new('https://www.dailymotion.com/services/oembed')
DailymotionProvider << 'http://*.dailymotion.com/video/*'
DailymotionProvider << 'https://*.dailymotion.com/video/*'
DailymotionProvider << 'http://*.dai.ly/*'
DailymotionProvider << 'https://*.dai.ly/*'

# ruby-oembed's Dailymotion provider is from Embedly and requires an API key, so we make our own.
OEmbed::Providers.register(DailymotionProvider)
