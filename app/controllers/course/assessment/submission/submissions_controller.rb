# frozen_string_literal: true
class Course::Assessment::Submission::SubmissionsController < \
  Course::Assessment::Submission::Controller
  include Course::Assessment::Submission::SubmissionsControllerServiceConcern
  include Signals::EmissionConcern
  include Course::Assessment::Submission::MonitoringConcern

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

  signals :assessment_submissions, after: [:unsubmit, :delete]
  signals :assessment_submissions, after: [:update], if: -> { @submission.saved_change_to_workflow_state? }

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

    @assessment = @assessment.calculated(:maximum_grade)
    @submissions = @submissions.calculated(:log_count, :graded_at, :grade, :grader_ids)
    @my_students = current_course_user&.my_students || []
    @course_users = current_course.course_users.order_phantom_user.order_alphabetically
  end

  def create # rubocop:disable Metrics/AbcSize
    authorize! :access, @assessment

    existing_submission = @assessment.submissions.find_by(creator: current_user)
    create_success_response(existing_submission) and return if existing_submission

    ActiveRecord::Base.transaction do
      @submission.session_id = authentication_service.generate_authentication_token
      success = @assessment.create_new_submission(@submission, current_user)
      raise ActiveRecord::Rollback unless success

      authentication_service.save_token_to_session(@submission.session_id)
      log_service.log_submission_access(request) if @assessment.session_password_protected?
      monitoring_service&.create_new_session_if_not_exist! if should_monitor?

      create_success_response(@submission)
    end
  rescue StandardError
    error_message = @submission.errors.full_messages.to_sentence
    render json: { error: error_message }, status: :bad_request
  end

  def edit
    return render json: { isSubmissionBlocked: true } if @submission.submission_view_blocked?(current_course_user)

    @monitoring_session_id = monitoring_service&.session&.id if should_monitor?
    @submission = @submission.calculated(:graded_at, :grade) unless @submission.attempting?
  end

  def auto_grade
    authorize!(:grade, @submission)
    job = @submission.auto_grade!

    render partial: 'jobs/submitted', locals: { job: job.job }
  end

  def reevaluate_answer
    @answer = @submission.answers.find_by(id: reload_answer_params[:answer_id])

    return head :bad_request if @answer.nil?

    job = @answer.auto_grade!(redirect_to_path: nil, reduce_priority: true)
    render partial: 'jobs/submitted', locals: { job: job.job }
  end

  def generate_feedback
    @answer = @submission.answers.find_by(id: reload_answer_params[:answer_id])

    return head :bad_request if @answer.nil?

    job = @answer.generate_feedback
    render partial: 'jobs/submitted', locals: { job: job }
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

    render @new_answer
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

      render partial: 'jobs/submitted', locals: { job: job }
    end
  end

  # Force submit all submissions.
  def force_submit_all
    authorize!(:force_submit_assessment_submission, @assessment)
    attempting_submissions = @assessment.submissions.by_users(course_user_ids).with_attempting_state

    if !attempting_submissions.empty? || !user_ids_without_submission.empty?
      job = Course::Assessment::Submission::ForceSubmittingJob.
            perform_later(@assessment, course_user_ids.pluck(:user_id), user_ids_without_submission, current_user).job

      render partial: 'jobs/submitted', locals: { job: job }
    else
      head :ok
    end
  end

  # Download either all of or a subset of submissions for an assessment.
  def download_all
    authorize!(:manage, @assessment)
    if not_downloadable
      head :bad_request
    else
      render partial: 'jobs/submitted', locals: { job: download_job }
    end
  end

  def download_statistics
    authorize!(:manage, @assessment)
    submission_ids = @assessment.submissions.by_users(course_user_ids).pluck(:id)
    if submission_ids.empty?
      return render json: {
        error: I18n.t('course.assessment.submission.submissions.download_statistics.no_submission_statistics')
      }, status: :bad_request
    end

    job = Course::Assessment::Submission::StatisticsDownloadJob.
          perform_later(current_course, current_user, submission_ids).job

    render partial: 'jobs/submitted', locals: { job: job }
  end

  def unsubmit
    authorize!(:update, @assessment)
    @submission = @assessment.submissions.find(params[:submission_id])
    success = @submission.transaction do
      @submission.update!('unmark' => 'true') if @submission.graded?
      @submission.update!('unsubmit' => 'true')
      monitoring_service&.continue_listening!

      true
    end
    if success
      head :ok
    else
      logger.error("Failed to unsubmit submission: #{@submission.errors.inspect}")
      render json: { errors: @submission.errors }, status: :bad_request
    end
  end

  def unsubmit_all
    authorize!(:update, @assessment)
    submission_ids = @assessment.submissions.by_users(course_user_ids).pluck(:id)
    return head :ok if submission_ids.empty?

    job = Course::Assessment::Submission::UnsubmittingJob.
          perform_later(current_user, submission_ids, @assessment, nil).job

    render partial: 'jobs/submitted', locals: { job: job }
  end

  def delete
    @submission = @assessment.submissions.find(params[:submission_id])
    authorize!(:delete_submission, @submission)

    ActiveRecord::Base.transaction do
      reset_question_bundle_assignments if @assessment.randomization == 'prepared'
      monitoring_service&.stop!
      @submission.destroy!

      head :ok
    end
  rescue StandardError
    logger.error("Failed to delete submission: #{@submission.errors.inspect}")
    render json: { errors: @submission.errors }, status: :bad_request
  end

  def reset_question_bundle_assignments
    qbas = @assessment.question_bundle_assignments.where(submission: @submission).lock!
    raise ActiveRecord::Rollback unless qbas.update_all(submission_id: nil)
  end

  def delete_all
    authorize!(:delete_all_submissions, @assessment)
    submission_ids = @assessment.submissions.by_users(course_user_ids).pluck(:id)
    return head :ok if submission_ids.empty?

    job = Course::Assessment::Submission::DeletingJob.
          perform_later(current_user, submission_ids, @assessment).job

    render partial: 'jobs/submitted', locals: { job: job }
  end

  private

  def create_params
    { course_user: current_course_user }
  end

  def create_success_response(submission)
    redirect_url = edit_course_assessment_submission_path(current_course, @assessment, submission)
    render json: { redirectUrl: redirect_url }
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

    render json: { newSessionUrl: new_session_path }
  end

  def authentication_service
    @authentication_service ||=
      Course::Assessment::SessionAuthenticationService.new(@assessment, session, @submission)
  end

  def log_service
    @log_service ||=
      Course::Assessment::SessionLogService.new(@assessment, session, @submission)
  end

  def not_downloadable
    @assessment.submissions.confirmed.empty? ||
      (params[:download_format] == 'zip' && !@assessment.files_downloadable?) ||
      (params[:download_format] == 'csv' && !@assessment.csv_downloadable?)
  end

  def download_job
    if params[:download_format] == 'csv'
      Course::Assessment::Submission::CsvDownloadJob.
        perform_later(current_course_user, @assessment, params[:course_users]).job
    else
      Course::Assessment::Submission::ZipDownloadJob.
        perform_later(current_course_user, @assessment, params[:course_users]).job
    end
  end

  # Check for zombie jobs, create new grading jobs if there's any zombie jobs.
  # TODO: Remove this method after found the cause of the dead jobs.
  def check_zombie_jobs # rubocop:disable Metrics/AbcSize, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity
    return unless @submission.attempting?

    submitted_answers = @submission.answers.latest_answers.select(&:submitted?)
    return if submitted_answers.empty?

    dead_answers = submitted_answers.select do |a|
      job = a.auto_grading&.job
      job&.submitted? && job.created_at < Time.zone.now - 60.minutes
    end

    dead_answers.each do |a|
      old_job = a.auto_grading.job
      job = a.auto_grade!(redirect_to_path: old_job.redirect_to, reduce_priority: true)

      logger.debug(message: 'Restart Answer Grading', answer_id: a.id, job_id: job.job.id,
                   old_job_id: old_job.id)
    end
  end

  def course_user_ids # rubocop:disable Metrics/AbcSize
    @course_user_ids ||= case params[:course_users]
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
