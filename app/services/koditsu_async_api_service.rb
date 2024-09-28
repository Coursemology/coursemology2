# frozen_string_literal: true

class KoditsuAsyncApiService
  def config
    ENV.fetch('KODITSU_API_URL')
  end

  def initialize(api_namespace, payload)
    url = config
    @api_endpoint = "#{url}/#{api_namespace}"
    @payload = payload
  end

  def post
    connection = Excon.new(@api_endpoint)
    response = connection.post(
      headers: {
        'x-api-key' => ENV['KODITSU_API_KEY'],
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
        'x-api-key' => ENV['KODITSU_API_KEY'],
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
        'x-api-key' => ENV['KODITSU_API_KEY']
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
        'x-api-key' => ENV['KODITSU_API_KEY']
      }
    )
    parse_response(response)
  rescue Excon::Errors::Timeout, Excon::Errors::SocketError, Excon::Errors::HTTPStatusError => _e
    [500, nil]
  end

  def self.language_valid_for_koditsu?(language)
    koditsu_language_whitelist.include?(language.type.constantize)
  end

  def self.koditsu_language_whitelist
    [Coursemology::Polyglot::Language::CPlusPlus,
     Coursemology::Polyglot::Language::Python::Python3Point4,
     Coursemology::Polyglot::Language::Python::Python3Point5,
     Coursemology::Polyglot::Language::Python::Python3Point6,
     Coursemology::Polyglot::Language::Python::Python3Point7,
     Coursemology::Polyglot::Language::Python::Python3Point9,
     Coursemology::Polyglot::Language::Python::Python3Point10,
     Coursemology::Polyglot::Language::Python::Python3Point12]
  end

  def self.assessment_url(assessment_id)
    url = ENV['KODITSU_WEB_URL']

    "#{url}?assessment=#{assessment_id}"
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
