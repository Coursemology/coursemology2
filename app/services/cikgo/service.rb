# frozen_string_literal: true
class Cikgo::Service
  class << self
    private

    CIKGO_OAUTH_APPLICATION_NAME = 'Cikgo'

    def connection(method, path, options = {})
      endpoint, api_key = config

      connection = Excon.new(
        "#{endpoint}/#{path}",
        headers: { Authorization: "Bearer #{api_key}" },
        method: method,
        **options,
        body: options[:body]&.to_json
      )

      response = connection.request
      parse_json(response.body)
    end

    def parse_json(json)
      JSON.parse(json, symbolize_names: true)
    rescue JSON::ParserError
      nil
    end

    def config
      endpoint = ENV.fetch('CIKGO_ENDPOINT')
      api_key = ENV.fetch('CIKGO_API_KEY')

      [endpoint, api_key]
    rescue StandardError => e
      raise e unless Rails.env.production?
    end
  end
end
