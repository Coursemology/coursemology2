# frozen_string_literal: true

class SsidApiService
  def self.api_url
    Rails.application.credentials.ssid.url
  end

  # Validate that the URL is in the whitelist before allowing uploads to it.
  # This is to prevent leaking data in case the SSID response is intercepted.
  def self.upload_whitelist
    Regexp.new(Rails.application.credentials.ssid.upload_whitelist_pattern)
  end

  def initialize(api_namespace, payload, url = nil)
    @api_namespace = api_namespace
    @payload = payload
    @url = url || self.class.api_url
  end

  def post
    response = connection.post(@api_namespace) do |req|
      req.headers['Content-Type'] = 'application/json'
      req.body = @payload.to_json
    end
    parse_response(response)
  rescue Faraday::TimeoutError, Faraday::ConnectionFailed, Faraday::ClientError => _e
    [500, nil]
  end

  def post_multipart(form_data)
    response = connection.post(@api_namespace) do |req|
      req.body = form_data
    end
    parse_response(response)
  rescue Faraday::TimeoutError, Faraday::ConnectionFailed, Faraday::ClientError => _e
    [500, nil]
  end

  def get
    response = connection.get(@api_namespace) do |req|
      req.params = @payload
    end
    parse_response(response)
  rescue Faraday::TimeoutError, Faraday::ConnectionFailed, Faraday::ClientError => _e
    [500, nil]
  end

  private

  def connection
    @connection ||= Faraday.new(url: @url) do |builder|
      if @url == self.class.api_url
        builder.request :authorization, 'Bearer', -> { Rails.application.credentials.ssid.api_key }
      end
      builder.request :multipart
    end
  end

  def parse_response(response)
    response_status = response.status
    response_body = valid_json(response.body)
    [response_status, response_body]
  end

  def valid_json(json)
    JSON.parse(json)
  rescue JSON::ParserError => _e
    { 'success' => false, 'message' => json }
  end
end
