# frozen_string_literal: true
class Course::Assessment::Submission::SubmissionsController < \
  Course::Assessment::Submission::Controller
  include Course::Assessment::Submission::SubmissionsControllerServiceConcern

  before_action :authorize_assessment!, only: :create
  skip_authorize_resource :submission, only: [:edit, :update, :auto_grade]
  before_action :authorize_submission!, only: [:edit, :update]
  before_action :check_password, only: [:edit, :update]
  before_action :load_or_create_answers, only: [:edit, :update]

  delegate_to_service(:update)
  delegate_to_service(:load_or_create_answers)

  def index
    authorize!(:manage, @assessment)
    @submissions = @submissions.includes(:answers, experience_points_record: :course_user)
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
      render status: :bad_request
    elsif reload_answer_params[:reset_answer]
      @new_answer = @answer.reset_answer
    else
      @new_answer = @submission.answers.from_question(@current_question.id).last
    end
  end

  # Publish all the graded submissions.
  def publish_all
    graded_submissions = @assessment.submissions.with_graded_state
    if !graded_submissions.empty?
      job =
        Course::Assessment::Submission::PublishingJob.perform_later(@assessment, current_user).job
      redirect_to(job_path(job))
    else
      redirect_to course_assessment_submissions_path(current_course, @assessment),
                  notice: t('.notice')
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
      redirect_to new_course_assessment_session_path(
        current_course, @assessment, submission_id: @submission.id
      )
    end
  end

  def authentication_service
    @auth_service ||=
      Course::Assessment::SessionAuthenticationService.new(@assessment, session, @submission)
  end
end
