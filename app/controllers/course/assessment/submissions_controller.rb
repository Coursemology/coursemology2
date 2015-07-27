class Course::Assessment::SubmissionsController < Course::Assessment::Controller
  before_action :authorize_assessment, only: :create
  before_action :add_assessment_breadcrumb
  load_and_authorize_resource :submission, class: Course::Assessment::Submission.name,
                                           through: :assessment

  def create
    if @submission.save
      redirect_to edit_course_assessment_submission_path(current_course, @assessment, @submission)
    else
      redirect_to course_assessments_path(current_course),
                  danger: t('.failure', error: @submission.errors.full_messages.to_sentence)
    end
  end

  def edit
  end

  def update
    if @submission.update_attributes(update_params)
      redirect_to edit_course_assessment_submission_path(current_course, @assessment, @submission),
                  success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def create_params
    { course_user: current_course_user }
  end

  def update_params
    @update_params ||= params.require(:submission).permit()
  end

  def authorize_assessment
    authorize!(:attempt, @assessment)
  end

  def add_assessment_breadcrumb
    add_breadcrumb @assessment.title, course_assessment_path(current_course, @assessment)
  end
end
