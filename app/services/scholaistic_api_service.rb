# frozen_string_literal: true
class ScholaisticApiService
  class << self
    def new_assessment_path
      '/administration/assessments/new'
    end

    def edit_assessment_details_path(assessment_id)
      "/administration/assessments/#{assessment_id}/details"
    end

    def edit_assessment_path(assessment_id)
      "/administration/assessments/#{assessment_id}"
    end

    def assessment_path(assessment_id)
      "/assessments/#{assessment_id}"
    end

    def submissions_path(assessment_id)
      "/administration/assessments/#{assessment_id}/submissions"
    end

    def submission_path(assessment_id, submission_id)
      "/administration/assessments/#{assessment_id}/submissions/#{submission_id}"
    end

    def assistants_path
      '/administration/assistants'
    end

    def assistant_path(assistant_id)
      "/assistants/#{assistant_id}"
    end

    # TODO
    def embed(course_user, path)
      # connection!(course_user, :post, 'embed', body: {
      #   key: settings(course_user.course).integration_key,
      #   path: path
      # })

      # 'https://beta.scholaistic.com/courses/1adc364a-c5cb-45f2-80b8-09fec4fc19ce/administration/assessments/6c20d164-989d-498e-b792-5f4c98a2f9f4/submissions'
      'https://beta.scholaistic.com/courses/1adc364a-c5cb-45f2-80b8-09fec4fc19ce/administration/assessments/6c20d164-989d-498e-b792-5f4c98a2f9f4/details'
    end

    # TODO
    def assistant!(course, assistant_id)
      # connection!(:get, 'assistant', query: { key: settings(course).integration_key, id: assistant_id })

      {
        title: 'gptboy'
      }
    end

    # TODO
    def assistants!(course)
      # connection!(:get, 'assistants', query: { key: settings(course).integration_key })

      [{
        id: 'gptboy',
        title: 'gptboy',
        sidebar_title: 'gptboy'
      }, {
        id: 'gptgirl',
        title: 'gptgirl',
        sidebar_title: 'gptgirl'
      }]
    end

    # TODO
    def find_or_create_submission!(course_user, assessment_id)
      # connection!(course_user, :post, 'submission', body: {
      #   key: settings(course_user.course).integration_key,
      #   assessmentId: assessment_id,
      #   upsertCourseUser: course_user_upsert_payload(course_user)
      # })

      '12345' # Example submission ID
    end

    # TODO
    def submission!(course, submission_id)
      # connection!(:get, 'submission', query: {
      #   key: settings(course).integration_key,
      #   id: submission_id
      # })

      {
        creator_name: 'hamad',
        creator_email: 'russellsaerang1@gmail.com',
        status: :graded
      }
    rescue Excon::Error::NotFound
      { status: :not_found }
    end

    # TODO
    def submissions!(assessment_ids, course_user)
      # connection!(:post, 'submissions', body: {
      #   key: settings(course_user.course).integration_key,
      #   assessmentIds: assessment_ids,
      #   upsertCourseUser: course_user_upsert_payload(course_user)
      # })

      {
        '12345': {
          status: 'attempting',
          id: '12345'
        }
      }
    end

    # TODO
    def assessments!(course)
      # connection!(:get, 'assessments', query: {
      #   key: settings(course).integration_key,
      #   lastSynced: settings(course).last_synced_at
      # }.compact)

      {
        assessments: [
          {
            upstream_id: '12345',
            published: true,
            title: 'Sample Assessment2',
            description: 'This is a sample assessment for testing purposes.',
            start_at: Time.current.iso8601,
            end_at: (Time.current + 1.week).iso8601
          },
          {
            upstream_id: '67890',
            published: false,
            title: 'Draft Assessment',
            description: 'This assessment is still in draft mode and not yet published.',
            start_at: (Time.current + 1.day).iso8601
          }
          # {
          #   upstream_id: '11223',
          #   published: true,
          #   title: 'Upcoming Assessment',
          #   description: 'This assessment will be available in the future.',
          #   start_at: (Time.current + 2.days).iso8601
          # }
        ],
        deleted: ['11223'],
        last_synced_at: Time.current.iso8601
      }
    end

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

      dns_resolver = Resolv::DNS.new(nameserver: ['127.0.0.1'])
      dns_resolver.timeouts = 3
      resolver = Resolv.new([Resolv::Hosts.new, dns_resolver])

      connection = Excon.new(
        "#{api_base_url}/#{path}",
        headers: { Authorization: "Bearer #{api_key}" },
        method: method,
        timeout: DEFAULT_REQUEST_TIMEOUT_SECONDS,
        **options,
        body: options[:body]&.to_json,
        expects: [200, 201, 204],
        resolv_resolver: resolver
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

    def settings(course)
      course.settings(:course_scholaistic_component)
    end

    def scholaistic_course_user_role(course_user)
      return 'owner' if course_user.manager_or_owner?
      return 'manager' if course_user.staff?

      'student'
    end

    def course_user_upsert_payload(course_user)
      {
        name: course_user.name,
        email: course_user.user.email,
        role: scholaistic_course_user_role(course_user)
      }
    end
  end
end
