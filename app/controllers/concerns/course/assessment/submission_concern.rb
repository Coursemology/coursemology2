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

  # Blocks editing an attempting submission once the assessment deadline has passed (only when the
  # assessment disallows late submissions). Staff who can manage the assessment are exempt. The
  # submission is force-submitted at the deadline through ForceSubmitTimedSubmissionJob; this guard
  # closes the race window before that job lands and rejects direct API calls.
  def check_submission_deadline!
    return unless @submission.attempting?
    return if can?(:manage, @assessment)
    return unless @submission.editing_deadline_passed_for?(current_course_user)

    render json: { error: I18n.t('course.assessment.submission.submissions.deadline_passed') },
           status: :forbidden
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
