# frozen_string_literal: true
class Cikgo::Service
  class << self
    private

    def connection(method, path, options = {})
      connection = Excon.new(
        "#{ENV.fetch('CIKGO_ENDPOINT')}/#{path}",
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
