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
  delegate_to_service(:load_or_create_answers)
  delegate_to_service(:load_or_create_submission_questions)

  def index
    authorize!(:manage, @assessment)
    @assessment = @assessment.calculated(:maximum_grade)
    @submissions = @submissions.includes(:answers)
    @my_students = current_course_user.try(:my_students) || []
    @course_students = current_course.course_users.students.order_alphabetically
    if params[:published_success]
      flash.now[:success] = t('course.assessment.submission.submissions.publish_all.success')
    end
  end

  def create
    raise IllegalStateError if @assessment.questions.empty?
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

    calculated_fields = [:graded_at]
    @submission = @submission.calculated(*calculated_fields)
  end

  def auto_grade
    authorize!(:grade, @submission)
    job = @submission.auto_grade!
    redirect_to(job_path(job.job))
  end

  # Reload answer to either its latest status or to a fresh answer, depending on parameters.
  def reload_answer
    @answer = @submission.answers.find_by(id: reload_answer_params[:answer_id])
    @current_question = @answer.try(:question)

    if @answer.nil?
      head :bad_request
    elsif reload_answer_params[:reset_answer]
      @new_answer = @answer.reset_answer
    else
      @new_answer = @submission.answers.from_question(@current_question.id).last
    end
  end

  # Publish all the graded submissions.
  def publish_all
    authorize!(:publish_grades, @assessment)
    graded_submissions = @assessment.submissions.with_graded_state
    if !graded_submissions.empty?
      job = Course::Assessment::Submission::PublishingJob.
            perform_later(@assessment, current_user).job
      redirect_to(job_path(job))
    else
      redirect_to course_assessment_submissions_path(current_course, @assessment),
                  notice: t('.notice')
    end
  end

  # Download either all of or a subset of submissions for an assessment.
  def download_all
    authorize!(:manage, @assessment)
    if !@assessment.downloadable?
      redirect_to course_assessment_submissions_path(current_course, @assessment),
                  notice: t('.not_downloadable')
    elsif @assessment.submissions.confirmed.empty?
      redirect_to course_assessment_submissions_path(current_course, @assessment),
                  notice: t('.no_submissions')
    else
      job = Course::Assessment::Submission::ZipDownloadJob.
            perform_later(current_course_user, @assessment, params[:students]).job
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

  def check_password
    return unless @submission.attempting?
    return if !@assessment.password_protected? || can?(:manage, @assessment)

    unless authentication_service.authenticated?
      log_service.log_submission_access(request)

      redirect_to new_course_assessment_session_path(
        current_course, @assessment, submission_id: @submission.id
      )
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
  def check_zombie_jobs # rubocop:disable MethodLength, Metrics/AbcSize
    return unless @submission.attempting?

    submitted_answers = @submission.latest_answers.select(&:submitted?)
    return if submitted_answers.empty?

    dead_answers = submitted_answers.select do |a|
      job = a.auto_grading&.job
      job && job.submitted? &&
        job.created_at < Time.zone.now - Course::Assessment::ProgrammingEvaluation::TIMEOUT
    end

    dead_answers.each do |a|
      old_job = a.auto_grading.job
      job = a.auto_grade!(redirect_to_path: old_job.redirect_to,
                          reattempt: true, reduce_priority: true)

      logger.debug(message: 'Restart Answer Grading', answer_id: a.id, job_id: job.job.id,
                   old_job_id: old_job.id)
    end
  end
end
