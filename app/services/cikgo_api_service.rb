# frozen_string_literal: true
class CikgoApiService
  class << self
    def ping(push_key)
      response = connection(:get, 'repositories', query: { pushKey: push_key })
      { status: :ok, **response }
    rescue StandardError
      { status: :error }
    end

    private

    def connection(method, path, options = {})
      connection = Excon.new(
        "#{CIKGO_ENDPOINT}/#{path}",
        headers: { Authorization: "Bearer #{ENV.fetch('CIKGO_API_KEY')}" },
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
  end
end
