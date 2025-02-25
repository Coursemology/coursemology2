# frozen_string_literal: true
CarrierWave.configure do |config|
  if Rails.env.production?
    require 'carrierwave/storage/fog'

    config.storage = :fog
    config.fog_credentials = {
      provider: 'AWS',
      aws_access_key_id: ENV['AWS_ACCESS_KEY_ID'],
      aws_secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'],
      region: ENV['AWS_REGION']
    }
    config.fog_directory = ENV['AWS_BUCKET']
    config.fog_public = false
  else
    config.storage = :file
  end
  config.cache_dir = Rails.root.join('tmp/uploads')
end
