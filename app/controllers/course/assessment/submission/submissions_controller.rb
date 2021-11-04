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

  COURSE_USERS = { my_students: 'my_students',
                   my_students_w_phantom: 'my_students_w_phantom',
                   students: 'students',
                   students_w_phantom: 'students_w_phantom',
                   staff: 'staff',
                   staff_w_phantom: 'staff_w_phantom' }.freeze

  def index
    authorize!(:view_all_submissions, @assessment)

    respond_to do |format|
      format.html {}
      format.json do
        @assessment = @assessment.calculated(:maximum_grade)
        @submissions = @submissions.calculated(:log_count, :graded_at).includes(:answers)
        @my_students = current_course_user&.my_students || []
        @course_users = current_course.course_users.order_phantom_user.order_alphabetically.includes(:user)
      end
    end
  end

  def create
    existing_submission = @assessment.submissions.find_by(creator: current_user)
    if existing_submission
      @submission = existing_submission
      return redirect_to edit_course_assessment_submission_path(current_course, @assessment, @submission)
    end

    @submission.session_id = authentication_service.generate_authentication_token
    success = @assessment.create_new_submission(@submission, current_user)

    if success
      authentication_service.save_token_to_session(@submission.session_id)
      log_service.log_submission_access(request) if @assessment.session_password_protected?
      redirect_to edit_course_assessment_submission_path(current_course, @assessment, @submission,
                                                         new_submission: true)
    else
      redirect_to course_assessments_path(current_course),
                  danger: t('.failure', error: @submission.errors.full_messages.to_sentence)
    end
  end

  def edit
    return if @submission.attempting?

    render 'blocked' if @submission.assessment.block_student_viewing_after_submitted? && current_course_user.student?

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
    graded_submission_ids = @assessment.submissions.with_graded_state.by_users(course_user_ids).pluck(:id)
    if graded_submission_ids.empty?
      head :ok
    else
      job = Course::Assessment::Submission::PublishingJob.
            perform_later(graded_submission_ids, @assessment, current_user).job
      respond_to do |format|
        format.html { redirect_to(job_path(job)) }
        format.json { render json: { redirect_url: job_path(job) } }
      end
    end
  end

  # Force submit all submissions.
  def force_submit_all
    authorize!(:force_submit_assessment_submission, @assessment)
    attempting_submissions = @assessment.submissions.by_users(course_user_ids).with_attempting_state
    if !attempting_submissions.empty? || !user_ids_without_submission.empty?
      job = Course::Assessment::Submission::ForceSubmittingJob.
            perform_later(@assessment, user_ids_without_submission, current_user).job
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
    if !@assessment.downloadable? || @assessment.submissions.confirmed.empty?
      head :bad_request
    else
      job = Course::Assessment::Submission::ZipDownloadJob.
            perform_later(current_course_user, @assessment, params[:course_users]).job
      respond_to do |format|
        format.html { redirect_to(job_path(job)) }
        format.json { render json: { redirect_url: job_path(job) } }
      end
    end
  end

  def download_statistics
    authorize!(:manage, @assessment)
    submission_ids = @assessment.submissions.by_users(course_user_ids).pluck(:id)
    if submission_ids.empty?
      return render json: { error:
                    I18n.t('course.assessment.submission.submissions.download_statistics.no_submission_statistics') },
                    status: :bad_request
    end
    job = Course::Assessment::Submission::StatisticsDownloadJob.
          perform_later(current_user, submission_ids).job
    respond_to do |format|
      format.html { redirect_to(job_path(job)) }
      format.json { render json: { redirect_url: job_path(job) } }
    end
  end

  def unsubmit
    authorize!(:update, @assessment)
    submission = @assessment.submissions.find(params[:submission_id])
    if submission
      submission.update('unmark' => 'true') if submission.graded?
      submission.update('unsubmit' => 'true')
      head :ok
    else
      logger.error("failed to unsubmit submission: #{submission.errors.inspect}")
      render json: { errors: submission.errors }, status: :bad_request
    end
  end

  def unsubmit_all
    authorize!(:update, @assessment)
    submission_ids = @assessment.submissions.by_users(course_user_ids).pluck(:id)
    return head :ok if submission_ids.empty?

    redirect_to_path = course_assessment_submissions_path(@assessment.course, @assessment)
    job = Course::Assessment::Submission::UnsubmittingJob.
          perform_later(current_user, submission_ids, @assessment, nil, redirect_to_path).job
    respond_to do |format|
      format.html { redirect_to(job_path(job)) }
      format.json { render json: { redirect_url: job_path(job) } }
    end
  end

  def delete
    submission = @assessment.submissions.find(params[:submission_id])
    authorize!(:delete_submission, submission)
    if submission
      submission.update('unmark' => 'true') if submission.graded?
      submission.update('unsubmit' => 'true') unless submission.attempting?
      submission.destroy!
      head :ok
    else
      logger.error("failed to unsubmit submission: #{submission.errors.inspect}")
      render json: { errors: submission.errors }, status: :bad_request
    end
  end

  def delete_all
    authorize!(:delete_all_submissions, @assessment)
    submission_ids = @assessment.submissions.by_users(course_user_ids).pluck(:id)
    return head :ok if submission_ids.empty?

    job = Course::Assessment::Submission::DeletingJob.
          perform_later(current_user, submission_ids, @assessment).job
    respond_to do |format|
      format.html { redirect_to(job_path(job)) }
      format.json { render json: { redirect_url: job_path(job) } }
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
    return if !@assessment.session_password_protected? || can?(:manage, @assessment)
    return if authentication_service.authenticated?

    log_service.log_submission_access(request)

    respond_to do |format|
      format.html { redirect_to new_session_path }
      format.json { render json: { redirect_url: new_session_path, format: 'html' } }
    end
  end

  def authentication_service
    @authentication_service ||=
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

  def course_user_ids
    case params[:course_users]
    when COURSE_USERS[:my_students]
      current_course_user.my_students.without_phantom_users
    when COURSE_USERS[:my_students_w_phantom]
      current_course_user.my_students
    when COURSE_USERS[:students_w_phantom]
      @assessment.course.course_users.students
    when COURSE_USERS[:staff]
      @assessment.course.course_users.staff.without_phantom_users
    when COURSE_USERS[:staff_w_phantom]
      @assessment.course.course_users.staff
    else
      @assessment.course.course_users.students.without_phantom_users
    end.select(:user_id)
  end

  def user_ids_without_submission
    existing_submissions = @assessment.submissions.by_users(course_user_ids.pluck(:user_id))
    user_ids_with_submission = existing_submissions.pluck(:creator_id)
    course_user_ids.pluck(:user_id) - user_ids_with_submission
  end
end
