# frozen_string_literal: true

class CodaveriAsyncApiService
  CODAVERI_API_VERSION = 2.1

  def self.api_url
    Rails.application.credentials.dig(:codaveri, :url)
  end

  def self.api_key
    Rails.application.credentials.dig(:codaveri, :api_key)
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
        'x-api-version' => CODAVERI_API_VERSION,
        'Content-Type' => 'application/json'
      },
      body: @payload.to_json
    )
    parse_response(response)
  end

  def put
    connection = Excon.new(@api_endpoint)
    response = connection.put(
      headers: {
        'x-api-key' => self.class.api_key,
        'x-api-version' => CODAVERI_API_VERSION,
        'Content-Type' => 'application/json'
      },
      body: @payload.to_json
    )
    parse_response(response)
  end

  def get
    connection = Excon.new(@api_endpoint)
    response = connection.get(
      headers: {
        'x-api-key' => self.class.api_key,
        'x-api-version' => CODAVERI_API_VERSION
      },
      query: @payload
    )
    parse_response(response)
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
