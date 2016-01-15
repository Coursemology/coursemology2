class Course::Assessment::SubmissionsController < Course::Assessment::Controller
  before_action :authorize_assessment, only: :create
  load_resource :submission, class: Course::Assessment::Submission.name, through: :assessment
  authorize_resource :submission, except: [:edit, :update, :auto_grade]
  before_action :authorize_submission!, only: [:edit, :update]
  before_action :load_or_create_answers, only: [:edit, :update]
  before_action :add_assessment_breadcrumb

  def create
    fail IllegalStateError if @assessment.questions.empty?
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

  def update
    if @submission.update_attributes(update_params)
      redirect_to edit_course_assessment_submission_path(current_course, @assessment, @submission),
                  success: t('.success')
    else
      render 'edit'
    end
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

  def authorize_submission!
    if @submission.attempting?
      authorize!(:update, @submission)
    else
      authorize!(:read, @submission)
    end
  end

  def create_params
    { course_user: current_course_user }
  end

  def update_params
    @update_params ||= begin
      params.require(:submission).permit(
        *workflow_state_params,
        answers_attributes: [:id] + update_answers_params
      )
    end
  end

  # The permitted state changes that will be provided to the model.
  def workflow_state_params
    result = []
    result << :finalise if can?(:update, @submission)
    result.push(:publish, :unsubmit) if can?(:grade, @submission)
    result
  end

  # The permitted parameters for answers and their specific answer types.
  #
  # This varies depending on the permissions of the user.
  def update_answers_params
    [].tap do |result|
      actable_attributes = [:id]
      actable_attributes.push(update_answer_type_params) if can?(:update, @submission)

      result.push(:grade) if can?(:grade, @submission)
      result.push(actable_attributes: actable_attributes)
    end
  end

  # The permitted parameters for each kind of answer.
  def update_answer_type_params
    scalar_params = [].tap do |result|
      result.push(:answer_text) # Text response answer
    end
    # Parameters that must be an array of permitted values
    array_params = {}.tap do |result|
      result[:option_ids] = [] # MRQ answer
      result[:files_attributes] = [:id, :_destroy, :filename, :content] # Programming answer
    end
    scalar_params.push(array_params)
  end

  def step_param
    params.permit(:step)[:step]
  end

  def authorize_assessment
    authorize!(:attempt, @assessment)
  end

  def load_or_create_answers
    return unless @submission.attempting?

    new_answers = questions_to_attempt.not_correctly_answered(@submission).attempt(@submission).
                  map { |answer| answer.save! if answer.new_record? }.
                  reduce(false) { |a, e| a || e }
    @submission.answers.reload if new_answers && @submission.answers.loaded?
  end

  def questions_to_attempt
    @questions_to_attempt ||= begin
      if @submission.assessment.guided?
        @submission.assessment.questions.step(@submission, step_param)
      else
        @submission.assessment.questions
      end
    end
  end
end
