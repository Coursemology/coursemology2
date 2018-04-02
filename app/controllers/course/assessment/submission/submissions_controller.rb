# frozen_string_literal: true
class Course::Assessment::Submission::SubmissionsController < \
  Course::Assessment::Submission::Controller
  include Course::Assessment::Submission::SubmissionsControllerServiceConcern

  before_action :authorize_assessment!, only: :create
  skip_authorize_resource :submission, only: [:edit, :update, :auto_grade]
  before_action :authorize_submission!, only: [:edit, :update]
  before_action :check_password, only: [:edit, :update]
  before_action :load_or_create_answers, only: [:edit, :update]
  before_action :check_zombie_jobs, only: [:edit]
  # Questions may be added to assessments with existing submissions.
  # In these cases, new submission_questions must be created when the submission is next
  # edited or updated.
  before_action :load_or_create_submission_questions, only: [:edit, :update]

  delegate_to_service(:update)
  delegate_to_service(:submit_answer)
  delegate_to_service(:load_or_create_answers)
  delegate_to_service(:load_or_create_submission_questions)

  STUDENTS = { my: 'my', phantom: 'phantom' }.freeze

  def index
    authorize!(:manage, @assessment)

    respond_to do |format|
      format.html {}
      format.json do
        @assessment = @assessment.calculated(:maximum_grade)
        @submissions = @submissions.calculated(:log_count, :graded_at).includes(:answers)
        @my_students = current_course_user&.my_students || []
        @course_students = current_course.course_users.students.order_alphabetically
      end
    end
  end

  def create
    @submission.session_id = authentication_service.generate_authentication_token!
    if @submission.save
      log_service.log_submission_access(request) if @assessment.password_protected?
      redirect_to edit_course_assessment_submission_path(current_course, @assessment, @submission,
                                                         new_submission: true)
    else
      redirect_to course_assessments_path(current_course),
                  danger: t('.failure', error: @submission.errors.full_messages.to_sentence)
    end
  end

  def edit
    return if @submission.attempting?

    respond_to do |format|
      format.html {}
      format.json do
        calculated_fields = [:graded_at]
        @submission = @submission.calculated(*calculated_fields)
      end
    end
  end

  def auto_grade
    authorize!(:grade, @submission)
    job = @submission.auto_grade!
    render json: { redirect_url: job_path(job.job) }
  end

  # Reload the current answer or reset it, depending on parameters.
  # current_answer has the most recent copy of the answer.
  def reload_answer
    @answer = @submission.answers.find_by(id: reload_answer_params[:answer_id])

    if @answer.nil?
      head :bad_request
      return
    elsif reload_answer_params[:reset_answer]
      @new_answer = @answer.reset_answer
    else
      @new_answer = @answer
    end

    respond_to do |format|
      format.json { render @new_answer }
    end
  end

  # Publish all the graded submissions.
  def publish_all
    authorize!(:publish_grades, @assessment)
    graded_submissions = @assessment.submissions.with_graded_state
    if !graded_submissions.empty?
      job = Course::Assessment::Submission::PublishingJob.
            perform_later(@assessment, current_user).job
      respond_to do |format|
        format.html { redirect_to(job_path(job)) }
        format.json { render json: { redirect_url: job_path(job) } }
      end
    else
      head :ok
    end
  end

  # Download either all of or a subset of submissions for an assessment.
  def download_all
    authorize!(:manage, @assessment)
    if !@assessment.downloadable?
      head :bad_request
    elsif @assessment.submissions.confirmed.empty?
      head :bad_request
    else
      job = Course::Assessment::Submission::ZipDownloadJob.
            perform_later(current_course_user, @assessment, params[:students]).job
      respond_to do |format|
        format.html { redirect_to(job_path(job)) }
        format.json { render json: { redirect_url: job_path(job) } }
      end
    end
  end

  def download_statistics
    authorize!(:manage, @assessment)
    submission_ids = @assessment.submissions.by_users(student_ids).pluck(:id)
    if submission_ids.empty?
      render json: { error:
             I18n.t('course.assessment.submission.submissions.download_statistics.no_submission_statistics') },
             status: :bad_request
    else
      job = Course::Assessment::Submission::StatisticsDownloadJob.
            perform_later(current_user, submission_ids).job
      respond_to do |format|
        format.html { redirect_to(job_path(job)) }
        format.json { render json: { redirect_url: job_path(job) } }
      end
    end
  end

  private

  def create_params
    { course_user: current_course_user }
  end

  def authorize_assessment!
    authorize!(:attempt, @assessment)
  end

  def authorize_submission!
    if @submission.attempting?
      authorize!(:update, @submission)
    else
      authorize!(:read, @submission)
    end
  end

  def reload_answer_params
    params.permit(:answer_id, :reset_answer)
  end

  def new_session_path
    new_course_assessment_session_path(
      current_course, @assessment, submission_id: @submission.id
    )
  end

  def check_password
    return unless @submission.attempting?
    return if !@assessment.password_protected? || can?(:manage, @assessment)

    unless authentication_service.authenticated?
      log_service.log_submission_access(request)

      respond_to do |format|
        format.html { redirect_to new_session_path }
        format.json { render json: { redirect_url: new_session_path, format: 'html' } }
      end
    end
  end

  def authentication_service
    @auth_service ||=
      Course::Assessment::SessionAuthenticationService.new(@assessment, session, @submission)
  end

  def log_service
    @log_service ||=
      Course::Assessment::SessionLogService.new(@assessment, session, @submission)
  end

  # Check for zombie jobs, create new grading jobs if there's any zombie jobs.
  # TODO: Remove this method after found the cause of the dead jobs.
  def check_zombie_jobs # rubocop:disable Metrics/AbcSize
    return unless @submission.attempting?

    submitted_answers = @submission.answers.latest_answers.select(&:submitted?)
    return if submitted_answers.empty?

    dead_answers = submitted_answers.select do |a|
      job = a.auto_grading&.job
      job&.submitted? &&
        job.created_at < Time.zone.now -
                         Course::Assessment::ProgrammingEvaluationService::DEFAULT_TIMEOUT
    end

    dead_answers.each do |a|
      old_job = a.auto_grading.job
      job = a.auto_grade!(redirect_to_path: old_job.redirect_to, reduce_priority: true)

      logger.debug(message: 'Restart Answer Grading', answer_id: a.id, job_id: job.job.id,
                   old_job_id: old_job.id)
    end
  end

  def student_ids
    case params[:students]
    when STUDENTS[:my]
      current_course_user.my_students
    when STUDENTS[:phantom]
      @assessment.course.course_users.students.phantom
    else
      @assessment.course.course_users.students.without_phantom_users
    end.select(:user_id)
  end
end
