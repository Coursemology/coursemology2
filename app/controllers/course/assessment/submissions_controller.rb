class Course::Assessment::SubmissionsController < Course::Assessment::Controller
  before_action :authorize_assessment, only: :create
  load_and_authorize_resource :submission, class: Course::Assessment::Submission.name,
                                           through: :assessment
  before_action :load_or_create_answers, only: [:edit, :update]

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
    @update_params ||= begin
      params.require(:submission).permit(
        answers_attributes: [:id, update_answers_params]
      )
    end
  end

  # The permitted parameters for answers and their specific answer types.
  #
  # This varies depending on the permissions of the user.
  def update_answers_params
    actable_attributes = [:id]
    actable_attributes.push(update_answer_type_params) if can?(:update, @submission)

    { actable_attributes: actable_attributes }
  end

  # The permitted parameters for each kind of answer.
  def update_answer_type_params
    {}.tap do |result|
      result[:option_ids] = [] # MRQ answers
    end
  end

  def authorize_assessment
    authorize!(:attempt, @assessment)
  end

  def load_or_create_answers
    new_answers = questions_to_attempt.attempt(@submission).
                  map { |answer| answer.save! if answer.new_record? }.
                  reduce(false) { |left, right| left || right }
    @submission.answers.reload if new_answers && @submission.answers.loaded
  end

  def questions_to_attempt
    @questions_to_attempt ||= @submission.assessment.questions
  end
end
