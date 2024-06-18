# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingCodaveriFeedbackJob < ApplicationJob
  include TrackableJob

  protected

  POLL_INTERVAL_SECONDS = 5
  MAX_POLL_RETRIES = 20

  def perform_tracked(assessment, question, answer)
    ActsAsTenant.without_tenant do
      feedback_service = Course::Assessment::Answer::ProgrammingCodaveriAsyncFeedbackService.
                         new(assessment, question, answer, 'solution')
      response_status, response_body, feedback_job_id = feedback_service.run_codaveri_feedback_service
      
      poll_count = 0
      until ![201, 202].include?(response_status) || poll_count >= MAX_POLL_RETRIES do
        sleep(POLL_INTERVAL_SECONDS)
        response_status, response_body = feedback_service.fetch_codaveri_feedback(id)
        poll_count += 1

        p({ poll_count: poll_count })
        p(response_body)
      end

      response_success = response_body['success']
      if response_status == 200 && response_success
        feedback_service.save_codaveri_feedback(response_body)
      else
        raise CodaveriError,
              { status: response_status, body: response_body }
      end
    end
  end
end
