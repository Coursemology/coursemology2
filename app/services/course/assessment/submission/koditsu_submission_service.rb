# frozen_string_literal: true
class Course::Assessment::Submission::KoditsuSubmissionService
  def initialize(assessment)
    @assessment = assessment
  end

  def run_fetch_all_submissions
    id = @assessment.koditsu_assessment_id
    koditsu_api_service = KoditsuAsyncApiService.new("api/assessment/#{id}/submissions", nil)

    response_status, response_body = koditsu_api_service.get

    if [200, 207].include?(response_status)
      [response_status, response_body['data']]
    else
      [response_status, nil]
    end
  end
end
