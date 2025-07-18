# frozen_string_literal: true
class Course::Assessment::Submission::SsidSimilarityService # rubocop:disable Metrics/ClassLength
  include Course::SsidFolderConcern

  POLL_INTERVAL_SECONDS = 2
  MAX_POLL_RETRIES = 1000

  def initialize(course, assessment)
    @course = course
    @assessment = assessment
  end

  def run_similarity_check
    create_ssid_folders
    run_upload_answers
    sync_ssid_submissions
    send_similarity_check_request

    poll_count = 0
    until poll_count >= MAX_POLL_RETRIES
      sleep(POLL_INTERVAL_SECONDS)
      response = fetch_similarity_check_result
      return response if response['status'] == 'successful'
      raise SsidError, { status: :ok, body: response } if response['status'] == 'failed'

      poll_count += 1
    end

    raise SsidError, { status: :request_timeout }
  end

  def fetch_similarity_result
    response = fetch_ssid_submission_pair_data

    ssid_id_to_submission_hash = @assessment.submissions.
                                 where.not(ssid_submission_id: nil).
                                 index_by(&:ssid_submission_id)

    submission_pair_data = response['submissionPairs']
    submission_pair_data.map do |pair|
      base_submission = ssid_id_to_submission_hash[pair['baseSubmission']]
      compared_submission = ssid_id_to_submission_hash[pair['comparedSubmission']]
      {
        base_submission: base_submission,
        compared_submission: compared_submission,
        similarity_score: pair['similarityScore'],
        submission_pair_id: pair['id']
      }
    end
  end

  def download_submission_pair_result(submission_pair_id)
    ssid_api_service = SsidAsyncApiService.new(
      "submission-pairs/#{submission_pair_id}/report", {}
    )
    response_status, response_body = ssid_api_service.get
    raise SsidError, { status: response_status, body: response_body } unless response_status == 200

    response_body['message']
  end

  def share_submission_pair_result(submission_pair_id)
    response = create_ssid_shared_resource_link('submission_pair', submission_pair_id)
    response['sharedUrl']
  end

  def share_assessment_result
    response = create_ssid_shared_resource_link('report', @assessment.ssid_folder_id)
    response['sharedUrl']
  end

  private

  def create_ssid_folders
    sync_assessment_ssid_folder(@course, @assessment)
  end

  def run_upload_answers
    zip_file = Course::Assessment::Submission::ZipDownloadService.download_and_zip(
      nil, @assessment, 'students_w_phantom', true
    )
    ssid_api_service = SsidAsyncApiService.new("folders/#{@assessment.ssid_folder_id}/submissions", {})
    response_status, response_body = ssid_api_service.post_multipart(zip_file)
    raise SsidError, { status: response_status, body: response_body } unless response_status == 204
  end

  def send_similarity_check_request
    ssid_api_service = SsidAsyncApiService.new("folders/#{@assessment.ssid_folder_id}/plagiarism-checks", {})
    response_status, response_body = ssid_api_service.post
    raise SsidError, { status: response_status, body: response_body } unless response_status == 202
  end

  def fetch_similarity_check_result
    ssid_api_service = SsidAsyncApiService.new("folders/#{@assessment.ssid_folder_id}/plagiarism-checks", {})
    response_status, response_body = ssid_api_service.get
    raise SsidError, { status: response_status, body: response_body } unless response_status == 200

    response_body['payload']['data']
  end

  def fetch_ssid_submissions
    ssid_api_service = SsidAsyncApiService.new("folders/#{@assessment.ssid_folder_id}/submissions", {})
    response_status, response_body = ssid_api_service.get
    raise SsidError, { status: response_status, body: response_body } unless response_status == 200

    response_body['payload']['data']
  end

  def sync_ssid_submissions
    fetch_ssid_submissions.each do |ssid_submission|
      submission_id = ssid_submission['name'].split('_').first.to_i
      ssid_submission_id = ssid_submission['id']

      @assessment.submissions.find_by(id: submission_id)&.update!(ssid_submission_id: ssid_submission_id)
    end
  end

  def fetch_ssid_submission_pair_data
    ssid_api_service = SsidAsyncApiService.new(
      "folders/#{@assessment.ssid_folder_id}/plagiarism-checks/latest", {}
    )
    response_status, response_body = ssid_api_service.get
    raise SsidError, { status: response_status, body: response_body } unless [200, 204].include?(response_status)

    response_body['payload']['data']
  end

  def create_ssid_shared_resource_link(resource_type, resource_id)
    ssid_api_service = SsidAsyncApiService.new('shared-resources', {
      resourceType: resource_type,
      resourceId: resource_id
    })
    response_status, response_body = ssid_api_service.post
    raise SsidError, { status: response_status, body: response_body } unless [200, 201].include?(response_status)

    response_body['payload']['data']
  end
end
