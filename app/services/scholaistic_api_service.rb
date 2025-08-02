# frozen_string_literal: true
class ScholaisticApiService
  class << self
    def ping_course(key)
      response = connection!(:get, 'course-link', query: { key: key })

      { status: :ok, title: response&.[](:title), url: response&.[](:url) }
    rescue StandardError => e
      Rails.logger.error("Failed to ping Scholaistic course: #{e.message}")
      raise e unless Rails.env.production?

      { status: :error }
    end

    def unlink_course!(key)
      connection!(:delete, 'course-link', query: { key: key })
    end

    def link_course_url!(options)
      payload = {
        rq: REQUESTER_PLATFORM_NAME,
        ex: COURSE_LINKING_EXPIRY.from_now.to_i,
        ap: api_key,
        rn: options[:course_title],
        ru: options[:course_url],
        cu: options[:callback_url]
      }

      public_key_string = connection!(:get, 'public-key')
      public_key = OpenSSL::PKey::RSA.new(public_key_string)
      encrypted_payload = Base64.encode64(public_key.public_encrypt(payload.to_json))

      URI.parse("#{base_url}/link-course").tap do |uri|
        uri.query = URI.encode_www_form(p: encrypted_payload)
      end.to_s
    end

    def parse_link_course_callback_request(request, params)
      scheme, request_api_key = request.headers['Authorization']&.split
      return nil unless scheme == 'Bearer' && request_api_key == api_key

      params.require(:key)
    end

    private

    REQUESTER_PLATFORM_NAME = 'Coursemology'
    COURSE_LINKING_EXPIRY = 10.minutes

    DEFAULT_REQUEST_TIMEOUT_SECONDS = 5

    def connection!(method, path, options = {})
      api_base_url = ENV.fetch('SCHOLAISTIC_API_BASE_URL')

      connection = Excon.new(
        "#{api_base_url}/#{path}",
        headers: { Authorization: "Bearer #{api_key}" },
        method: method,
        timeout: DEFAULT_REQUEST_TIMEOUT_SECONDS,
        **options,
        body: options[:body]&.to_json,
        expects: [200, 201, 204]
      )

      body = JSON.parse(connection.request.body, symbolize_names: true)

      body&.[](:payload)&.[](:data)
    rescue JSON::ParserError => e
      Rails.logger.error("Failed to parse JSON response from Scholaistic API: #{e.message}")
      raise e unless Rails.env.production?

      nil
    end

    def base_url
      ENV.fetch('SCHOLAISTIC_BASE_URL')
    end

    def api_key
      ENV.fetch('SCHOLAISTIC_API_KEY')
    end
  end
end
