# frozen_string_literal: true

if Rails.env.production?
  require 'autoload/aws_wrapped_client'
  require 'aws-sdk-cloudwatch'
  require 'aws-sdk-s3'

  # TODO: move this bucket to the proper staging/prod AWS account,
  # so it can reuse the instance profile credentials used by other AWS operations
  S3_CLIENT = Aws::S3::Client.new({
    region: Rails.application.credentials.aws.s3_file_bucket.region,
    credentials: Aws::Credentials.new(
      Rails.application.credentials.aws.s3_file_bucket.access_key_id,
      Rails.application.credentials.aws.s3_file_bucket.secret_access_key
    )
  })

  # For AWS operations, using client APIs are preferred
  # https://github.com/aws/aws-sdk-ruby/issues/2378#issuecomment-667247342
  # e.g. use Aws::CloudWatch::Client.put_metric_data instead of Aws::CloudWatch::Metric.put_data
  CLOUDWATCH_CLIENT = AwsWrappedClient.new(Aws::CloudWatch::Client)
end
