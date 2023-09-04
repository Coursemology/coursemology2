# frozen_string_literal: true

if Rails.env.production?
  require 'aws-sdk-s3'

  Aws.config.update({
    region: ENV['AWS_REGION'],
    credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY'])
  })

  S3_BUCKET = Aws::S3::Resource.new.bucket(ENV['AWS_BUCKET'])
end
