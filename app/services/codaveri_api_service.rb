# frozen_string_literal: true

class CodaveriApiService
  CODAVERI_ENDPOINT = 'https://api.codaveri.com'
  def initialize(api_namespace, payload)
    @api_endpoint = "#{CODAVERI_ENDPOINT}/#{api_namespace}"
    @payload = payload
  end

  def run_service
    response = connect_to_codaveri
    parse_response(response)
  end

  def connect_to_codaveri
    connection = Excon.new(@api_endpoint)
    connection.post(
      headers: {
        'x-api-key' => ENV['CODAVERI_API_KEY'],
        'Content-Type' => 'application/json'
      },
      body: @payload.to_json
    )
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
