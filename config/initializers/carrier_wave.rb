# frozen_string_literal: true
CarrierWave.configure do |config|
  if Rails.env.production?
    require 'carrierwave/storage/fog'

    config.storage = :fog
    config.fog_credentials = {
      provider: 'AWS',
      aws_access_key_id: Rails.application.credentials.aws.s3_file_bucket.access_key_id,
      aws_secret_access_key: Rails.application.credentials.aws.s3_file_bucket.secret_access_key,
      region: Rails.application.credentials.aws.s3_file_bucket.region
    }
    config.fog_directory = Rails.application.credentials.aws.s3_file_bucket.bucket
    config.fog_public = false
  else
    config.storage = :file
  end
  config.cache_dir = Rails.root.join('tmp/uploads')
end
