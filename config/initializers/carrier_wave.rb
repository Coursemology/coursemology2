# frozen_string_literal: true
CarrierWave.configure do |config|
  if Rails.env.production?
    require 'carrierwave/storage/fog'

    config.storage = :fog
    config.fog_credentials = { provider: 'AWS' }
    config.fog_attributes = { s3_client: S3_CLIENT } # reuse credentials from aws.rb
    config.fog_directory = ENV['AWS_BUCKET']
    config.fog_public = false
  else
    config.storage = :file
  end
  config.cache_dir = Rails.root.join('tmp/uploads')
end
