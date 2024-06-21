# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingCodaveriFeedbackJob < ApplicationJob
  include TrackableJob

  protected

  POLL_INTERVAL_SECONDS = 2
  MAX_POLL_RETRIES = 1000

  def perform_tracked(assessment, question, answer)
    ActsAsTenant.without_tenant do
      feedback_service = Course::Assessment::Answer::ProgrammingCodaveriAsyncFeedbackService.
                         new(assessment, question, answer, 'solution', false)
      response_status, response_body, feedback_id = feedback_service.run_codaveri_feedback_service
      
      poll_count = 0
      until ![201, 202].include?(response_status) || poll_count >= MAX_POLL_RETRIES do
        sleep(POLL_INTERVAL_SECONDS)
        response_status, response_body = feedback_service.fetch_codaveri_feedback(feedback_id)
        poll_count += 1
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
