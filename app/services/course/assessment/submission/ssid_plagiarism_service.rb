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

  def start_plagiarism_check
    create_ssid_folders
    run_upload_answers
    send_plagiarism_check_request
  end

  def fetch_plagiarism_result(limit, offset)
    ssid_id_to_submission_hash = sync_ssid_submissions
    submission_pair_data = fetch_ssid_submission_pair_data(limit, offset)
    submission_pair_data.map do |pair|
      base_submission_id = pair['baseSubmission']['id']
      base_submission = ssid_id_to_submission_hash[base_submission_id]
      next unless base_submission

      compared_submission_id = pair['comparedSubmission']['id']
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

  def fetch_plagiarism_check_result
    ssid_api_service = SsidAsyncApiService.new("folders/#{@main_assessment.ssid_folder_id}/plagiarism-checks", {})
    response_status, response_body = ssid_api_service.get
    raise SsidError, { status: response_status, body: response_body } unless response_status == 200

    response_body['payload']['data']
  end

  private

  def create_ssid_folders
    @linked_assessments.each do |assessment|
      sync_assessment_ssid_folder(assessment.course, assessment)
    end
  end

  def run_upload_answers
    @linked_assessments.each do |assessment|
      service = Course::Assessment::Submission::SsidZipDownloadService.new(assessment)
      zip_files = service.download_and_zip
      ssid_api_service = SsidAsyncApiService.new("folders/#{assessment.ssid_folder_id}/submissions", {})
      zip_files.each do |zip_file|
        response_status, response_body = ssid_api_service.post_multipart(zip_file)
        raise SsidError, { status: response_status, body: response_body } unless response_status == 204
      end
    ensure
      service&.cleanup
    end
  end

  def send_plagiarism_check_request
    ssid_api_service = SsidAsyncApiService.new("folders/#{@main_assessment.ssid_folder_id}/plagiarism-checks", {
      comparedFolderIds: @linked_assessments.pluck(:ssid_folder_id)
    })
    response_status, response_body = ssid_api_service.post
    raise SsidError, { status: response_status, body: response_body } unless response_status == 202
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

  def fetch_ssid_submission_pair_data(limit, offset)
    ssid_api_service = SsidAsyncApiService.new(
      "folders/#{@main_assessment.ssid_folder_id}/plagiarism-checks/latest/submission-pairs",
      { limit: limit, offset: offset }
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
