# frozen_string_literal: true
class Course::Assessment::SubmissionsController < Course::Assessment::Controller
  include Course::Assessment::SubmissionControllerServiceConcern

  before_action :authorize_assessment, only: :create
  load_resource :submission, class: Course::Assessment::Submission.name, through: :assessment
  authorize_resource :submission, except: [:edit, :update, :auto_grade]
  before_action :authorize_submission!, only: [:edit, :update]
  before_action :load_or_create_answers, only: [:edit, :update]
  before_action :add_assessment_breadcrumb

  delegate_to_service(:update)
  delegate_to_service(:load_or_create_answers)

  def create
    raise IllegalStateError if @assessment.questions.empty?
    if @submission.save
      redirect_to edit_course_assessment_submission_path(current_course, @assessment, @submission)
    else
      redirect_to course_assessments_path(current_course),
                  danger: t('.failure', error: @submission.errors.full_messages.to_sentence)
    end
  end

  def edit
    return if @submission.attempting?

    calculated_fields = [:submitted_at, :grade, :graded_at]
    @submission = @submission.calculated(*calculated_fields)
  end

  def auto_grade
    authorize!(:grade, @submission)
    job = @submission.auto_grade!
    redirect_to(job_path(job.job))
  end

  protected

  def add_assessment_breadcrumb
    add_breadcrumb(@assessment.title, course_assessment_path(current_course, @assessment))
  end

  private

  def create_params
    { course_user: current_course_user }
  end

  def authorize_assessment
    authorize!(:attempt, @assessment)
  end

  def authorize_submission!
    if @submission.attempting?
      authorize!(:update, @submission)
    else
      authorize!(:read, @submission)
    end
  end
end
