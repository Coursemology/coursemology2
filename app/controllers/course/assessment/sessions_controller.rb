# frozen_string_literal: true
class Course::Assessment::SessionsController < Course::Assessment::Controller
  before_action :load_and_authorize_submission

  def new
  end

  def create
    if authentication_service.authenticate(create_params[:password])
      redirect_or_create_submission
    else
      render json: { errors: @assessment.errors }, status: :bad_request
    end
  end

  private

  def load_and_authorize_submission
    load_submission
    authorize!(:edit, @submission) if @submission
  end

  def load_submission
    submission_id = case action_name
                    when 'new'
                      params[:submission_id]
                    when 'create'
                      create_params[:submission_id]
                    end
    @submission ||= @assessment.submissions.find(submission_id) if submission_id.present?
  end

  def redirect_or_create_submission
    if @submission
      log_service.log_submission_access(request)
      url = edit_course_assessment_submission_path(current_course, @assessment, @submission)
    else
      url = course_assessment_path(current_course, @assessment)
    end
    render json: { redirectUrl: url }
  end

  def create_params
    params.require(:session).permit(:password, :submission_id)
  end

  def authentication_service
    @authentication_service ||=
      Course::Assessment::SessionAuthenticationService.new(@assessment, current_session_id, @submission)
  end

  def log_service
    @log_service ||=
      Course::Assessment::SessionLogService.new(@assessment, current_session_id, @submission)
  end
end
