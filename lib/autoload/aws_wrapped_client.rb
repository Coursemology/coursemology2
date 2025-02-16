# frozen_string_literal: true

class AwsWrappedClient
  # this url will be valid when run in the ec2 instance
  # https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html
  CREDENTIALS_URL = 'http://169.254.169.254/latest/meta-data/iam/security-credentials/'

  def initialize(client_class, region: ENV.fetch('AWS_REGION', nil))
    @client_class = client_class
    @region = region
    refresh_token
  end

  def refresh_token
    @credentials = fetch_credentials
    @expiration = @credentials[:expiration]
    @client = @client_class.new(client_config)
  end

  def refresh_token_if_needed
    # Refresh 5 minutes before expiry
    refresh_token if Time.now >= @expiration - 300
  end

  def method_missing(method, ...)
    refresh_token_if_needed
    @client.public_send(method, ...)
  end

  def respond_to_missing?(method, include_private = false)
    @client.respond_to?(method, include_private) || super
  end

  private

  def fetch_credentials
    raise NotImplementedError unless Rails.env.production?

    imdsv2_client = Aws::EC2Metadata.new

    # this API always returns a string
    # https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/EC2Metadata.html
    role_name = imdsv2_client.get(CREDENTIALS_URL).strip
    credentials = JSON.parse(imdsv2_client.get("#{CREDENTIALS_URL}#{role_name}"))
    {
      access_key_id: credentials['AccessKeyId'],
      secret_access_key: credentials['SecretAccessKey'],
      session_token: credentials['Token'],
      expiration: Time.parse(credentials['Expiration'])
    }
  end

  def client_config
    {
      region: @region,
      access_key_id: @credentials[:access_key_id],
      secret_access_key: @credentials[:secret_access_key],
      session_token: @credentials[:session_token]
    }
  end
end
