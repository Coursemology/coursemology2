# frozen_string_literal: true
module Course::Assessment::SubmissionConcern
  extend ActiveSupport::Concern

  private

  def authorize_submission!
    if @submission.attempting?
      authorize!(:update, @submission)
    else
      authorize!(:read, @submission)
    end
  end

  def check_password
    return unless @submission.attempting?
    return if !@assessment.session_password_protected? || can?(:manage, @assessment)
    return if authentication_service.authenticated?

    log_service.log_submission_access(request)

    render json: { newSessionUrl: new_session_path }
  end

  def authentication_service
    @authentication_service ||=
      Course::Assessment::SessionAuthenticationService.new(@assessment, current_session_id, @submission)
  end

  def log_service
    @log_service ||=
      Course::Assessment::SessionLogService.new(@assessment, current_session_id, @submission)
  end

  def new_session_path
    new_course_assessment_session_path(
      current_course, @assessment, submission_id: @submission.id
    )
  end
end
