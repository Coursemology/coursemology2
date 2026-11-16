# frozen_string_literal: true

class KoditsuAsyncApiService
  def self.api_url
    Rails.application.credentials.dig(:koditsu, :api_url)
  end

  def self.api_key
    Rails.application.credentials.dig(:koditsu, :api_key)
  end

  def self.web_url
    Rails.application.credentials.dig(:koditsu, :web_url)
  end

  def initialize(api_namespace, payload)
    url = self.class.api_url
    @api_endpoint = "#{url}/#{api_namespace}"
    @payload = payload
  end

  def post
    connection = Excon.new(@api_endpoint)
    response = connection.post(
      headers: {
        'x-api-key' => self.class.api_key,
        'Content-Type' => 'application/json'
      },
      body: @payload.to_json
    )
    parse_response(response)
  rescue Excon::Errors::Timeout, Excon::Errors::SocketError, Excon::Errors::HTTPStatusError => _e
    [500, nil]
  end

  def put
    connection = Excon.new(@api_endpoint)
    response = connection.put(
      headers: {
        'x-api-key' => self.class.api_key,
        'Content-Type' => 'application/json'
      },
      body: @payload.to_json
    )
    parse_response(response)
  rescue Excon::Errors::Timeout, Excon::Errors::SocketError, Excon::Errors::HTTPStatusError => _e
    [500, nil]
  end

  def get
    connection = Excon.new(@api_endpoint)
    response = connection.get(
      headers: {
        'x-api-key' => self.class.api_key
      }
    )
    parse_response(response)
  rescue Excon::Errors::Timeout, Excon::Errors::SocketError, Excon::Errors::HTTPStatusError => _e
    [500, nil]
  end

  def delete
    connection = Excon.new(@api_endpoint)
    response = connection.delete(
      headers: {
        'x-api-key' => self.class.api_key
      }
    )
    parse_response(response)
  rescue Excon::Errors::Timeout, Excon::Errors::SocketError, Excon::Errors::HTTPStatusError => _e
    [500, nil]
  end

  def self.assessment_url(assessment_id)
    "#{web_url}?assessment=#{assessment_id}"
  end

  private

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
