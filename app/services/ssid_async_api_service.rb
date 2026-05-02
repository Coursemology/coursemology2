# frozen_string_literal: true

class SsidAsyncApiService
  def self.api_url
    Rails.application.credentials.dig(:ssid, :url)
  end

  def self.api_key
    Rails.application.credentials.dig(:ssid, :api_key)
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

  def post_multipart(file_path)
    form_data = { 'file' => Faraday::Multipart::FilePart.new(file_path, 'application/zip') }
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
      builder.request :authorization, 'Bearer', -> { self.class.api_key } if @url == self.class.api_url
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
