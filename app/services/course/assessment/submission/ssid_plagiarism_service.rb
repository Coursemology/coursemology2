# frozen_string_literal: true
class Course::Assessment::Submission::SsidPlagiarismService # rubocop:disable Metrics/ClassLength
  include Course::SsidFolderConcern

  POLL_INTERVAL_SECONDS = 2
  MAX_POLL_RETRIES = 1000

  def initialize(course, assessment)
    @course = course
    @main_assessment = assessment
    @linked_assessments = assessment.all_linked_assessments
  end

  def run_plagiarism_check
    create_ssid_folders
    run_upload_answers
    send_plagiarism_check_request

    poll_count = 0
    until poll_count >= MAX_POLL_RETRIES
      sleep(POLL_INTERVAL_SECONDS)
      response = fetch_plagiarism_check_result
      return response if response['status'] == 'successful'
      raise SsidError, { status: :ok, body: response } if response['status'] == 'failed'

      poll_count += 1
    end

    raise SsidError, { status: :request_timeout }
  end

  def fetch_plagiarism_result
    ssid_id_to_submission_hash = sync_ssid_submissions
    response = fetch_ssid_submission_pair_data

    submission_pair_data = response['submissionPairs']
    submission_pair_data.map do |pair|
      base_submission_id = if pair['baseSubmission'].is_a?(String)
                             pair['baseSubmission']
                           else
                             pair['baseSubmission']['id']
                           end
      base_submission = ssid_id_to_submission_hash[base_submission_id]
      next unless base_submission

      compared_submission_id = if pair['comparedSubmission'].is_a?(String)
                                 pair['comparedSubmission']
                               else
                                 pair['comparedSubmission']['id']
                               end
      compared_submission = ssid_id_to_submission_hash[compared_submission_id]
      next unless compared_submission

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
    response = create_ssid_shared_resource_link('report', @main_assessment.ssid_folder_id)
    response['sharedUrl']
  end

  private

  def create_ssid_folders
    @linked_assessments.each do |assessment|
      sync_assessment_ssid_folder(assessment.course, assessment)
    end
  end

  def run_upload_answers
    @linked_assessments.each do |assessment|
      zip_files = Course::Assessment::Submission::SsidZipDownloadService.download_and_zip(assessment)
      ssid_api_service = SsidAsyncApiService.new("folders/#{assessment.ssid_folder_id}/submissions", {})
      zip_files.each do |zip_file|
        response_status, response_body = ssid_api_service.post_multipart(zip_file)
        raise SsidError, { status: response_status, body: response_body } unless response_status == 204
      end
    end
  end

  def send_plagiarism_check_request
    ssid_api_service = SsidAsyncApiService.new("folders/#{@main_assessment.ssid_folder_id}/plagiarism-checks", {
      comparedFolderIds: @linked_assessments.pluck(:ssid_folder_id)
    })
    response_status, response_body = ssid_api_service.post
    raise SsidError, { status: response_status, body: response_body } unless response_status == 202
  end

  def fetch_plagiarism_check_result
    ssid_api_service = SsidAsyncApiService.new("folders/#{@main_assessment.ssid_folder_id}/plagiarism-checks", {})
    response_status, response_body = ssid_api_service.get
    raise SsidError, { status: response_status, body: response_body } unless response_status == 200

    response_body['payload']['data']
  end

  def fetch_ssid_submissions
    @linked_assessments.flat_map do |assessment|
      ssid_api_service = SsidAsyncApiService.new("folders/#{assessment.ssid_folder_id}/submissions", {})
      response_status, response_body = ssid_api_service.get
      raise SsidError, { status: response_status, body: response_body } unless response_status == 200

      response_body['payload']['data']
    end
  end

  def sync_ssid_submissions
    linked_assessments_with_parent_data = Course::Assessment.
                                          where(id: @linked_assessments.pluck(:id)).
                                          includes(submissions: [assessment: :course])
    submissions_by_id = linked_assessments_with_parent_data.flat_map(&:submissions).index_by(&:id)

    fetch_ssid_submissions.filter_map do |ssid_submission|
      submission_id = ssid_submission['name'].split('_').first.to_i
      submission = submissions_by_id[submission_id]
      [ssid_submission['id'], submission] if submission
    end.to_h
  end

  def fetch_ssid_submission_pair_data
    ssid_api_service = SsidAsyncApiService.new(
      "folders/#{@main_assessment.ssid_folder_id}/plagiarism-checks/latest", {}
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
