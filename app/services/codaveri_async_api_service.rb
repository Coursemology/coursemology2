# frozen_string_literal: true

class CodaveriAsyncApiService
  def config
    ENV.fetch('CODAVERI_URL')
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
        'x-api-key' => ENV['CODAVERI_API_KEY'],
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
        'x-api-key' => ENV['CODAVERI_API_KEY']
      },
      query: @payload
    )
    parse_response(response)
  end

  def self.language_valid_for_codaveri?(language)
    codaveri_language_whitelist.include?(language.type.constantize)
  end

  private

  def self.codaveri_language_whitelist
    [Coursemology::Polyglot::Language::Python::Python3Point4,
     Coursemology::Polyglot::Language::Python::Python3Point5,
     Coursemology::Polyglot::Language::Python::Python3Point6,
     Coursemology::Polyglot::Language::Python::Python3Point7,
     Coursemology::Polyglot::Language::Python::Python3Point9,
     Coursemology::Polyglot::Language::Python::Python3Point10,
     Coursemology::Polyglot::Language::Python::Python3Point12]
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
