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

    def manage_submission_path(assessment_id, submission_id)
      "/administration/assessments/#{assessment_id}/submissions/#{submission_id}"
    end

    def submission_path(assessment_id, submission_id)
      "/assessments/#{assessment_id}/submissions/#{submission_id}"
    end

    def assistants_path
      '/administration/assistants'
    end

    def assistant_path(assistant_id)
      "/assistants/#{assistant_id}"
    end

    def embed!(course_user, path, origin)
      connection!(:post, 'embed', body: {
        key: settings(course_user.course).integration_key,
        path: path,
        origin: origin,
        upsert_course_user: course_user_upsert_payload(course_user)
      })
    end

    def assistant!(course, assistant_id)
      result = connection!(:get, 'assistant', query: { key: settings(course).integration_key, id: assistant_id })

      { title: result[:title] }
    end

    def assistants!(course)
      result = connection!(:get, 'assistants', query: { key: settings(course).integration_key })

      result.filter_map do |assistant|
        next if assistant[:activityType] != 'assistant' || !assistant[:isPublished]

        {
          id: assistant[:id],
          title: assistant[:title],
          sidebar_title: assistant[:altTitle]
        }
      end
    end

    def find_or_create_submission!(course_user, assessment_id)
      result = connection!(:post, 'submission', body: {
        key: settings(course_user.course).integration_key,
        assessment_id: assessment_id,
        upsert_course_user: course_user_upsert_payload(course_user)
      })

      result[:id]
    end

    def submission!(course, submission_id)
      result = connection!(:get, 'submission', query: {
        key: settings(course).integration_key,
        id: submission_id
      })

      {
        creator_name: result[:creatorName],
        creator_email: result[:creatorEmail],
        status: result[:status]&.to_sym
      }
    rescue Excon::Error::NotFound
      { status: :not_found }
    end

    def submissions!(assessment_ids, course_user)
      result = connection!(:post, 'submissions', body: {
        key: settings(course_user.course).integration_key,
        assessment_ids: assessment_ids,
        upsert_course_user: course_user_upsert_payload(course_user)
      })

      result.to_h do |assessment_id, submission|
        [assessment_id.to_s,
         status: submission[:status]&.to_sym,
         id: submission[:submissionId]]
      end
    end

    def assessments!(course)
      result = connection!(:get, 'assessments', query: {
        key: settings(course).integration_key,
        lastSynced: settings(course).last_synced_at
      }.compact)

      {
        assessments: result[:assessments].filter_map do |assessment|
          next if assessment[:activityType] != 'assessment'

          {
            upstream_id: assessment[:id],
            published: assessment[:isPublished],
            title: assessment[:title],
            description: assessment[:description],
            start_at: assessment[:startsAt],
            end_at: assessment[:endsAt]
          }
        end,
        deleted: result[:deleted],
        last_synced_at: result[:lastSynced]
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
