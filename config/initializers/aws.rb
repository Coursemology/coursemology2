# frozen_string_literal: true

if Rails.env.production?
  require 'autoload/aws_wrapped_client'
  require 'aws-sdk-cloudwatch'
  require 'aws-sdk-s3'

  # TODO: move this bucket to the proper staging/prod AWS account,
  # so it can reuse the instance profile credentials used by other AWS operations
  S3_CLIENT = Aws::S3::Client.new({
    region: ENV.fetch('AWS_REGION', nil),
    credentials: Aws::Credentials.new(ENV.fetch('AWS_ACCESS_KEY_ID', nil), ENV.fetch('AWS_SECRET_ACCESS_KEY', nil))
  })

  # For AWS operations, using client APIs are preferred
  # https://github.com/aws/aws-sdk-ruby/issues/2378#issuecomment-667247342
  # e.g. use Aws::CloudWatch::Client.put_metric_data instead of Aws::CloudWatch::Metric.put_data
  CLOUDWATCH_CLIENT = AwsWrappedClient.new(Aws::CloudWatch::Client)
end
