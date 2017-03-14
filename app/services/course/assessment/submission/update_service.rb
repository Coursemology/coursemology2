# frozen_string_literal: true
class Course::Assessment::Submission::UpdateService < SimpleDelegator
  def update
    if params[:answer_id]
      submit_answer
    elsif @submission.update_attributes(update_params)
      redirect_to_edit
    else
      # The management buttons depends on the state of the submission
      @submission.workflow_state = @submission.workflow_state_was
      render 'edit'
    end
  end

  def load_or_create_answers
    return unless @submission.attempting?

    new_answers = questions_to_attempt.not_answered(@submission).attempt(@submission).
                  map { |answer| answer.save! if answer.new_record? }.
                  reduce(false) { |a, e| a || e }
    @submission.answers.reload if new_answers && @submission.answers.loaded?
  end

  protected

  # Service for handling the submission management logic, this serves as the super class for the
  # specific submission services.
  #
  # @param [Course::Assessment::SubmissionsController] controller the controller instance.
  # @param [Hash] variables a key value pairs of variables, which will be set as instance
  #   variables in the service. `{ name: 'Bob' }` will set a instance variable @name with the
  #   value of 'Bob' in the service.
  def initialize(controller, variables = {})
    super(controller)

    variables.each do |key, value|
      instance_variable_set("@#{key}", value)
    end
  end

  def update_params
    @update_params ||=
      if unsubmit? # Attributes like grades and exp should be not updated.
        params.require(:submission).permit(*workflow_state_params)
      else
        params.require(:submission).permit(
          *workflow_state_params,
          :points_awarded,
          answers_attributes: [:id] + update_answers_params
        )
      end
  end

  def submit_answer_params
    params.require(:submission).require(:answers_attributes).
      require(answer_id_param).permit(actable_attributes: [:id, update_answer_type_params])
  end

  private

  # The permitted state changes that will be provided to the model.
  def workflow_state_params
    result = []
    result << :finalise if can?(:update, @submission)
    result.push(:publish, :mark, :unsubmit) if can?(:grade, @submission)
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
      result.push(:option_ids) # MCQ answer
      result.push(attachments_params) # User uploaded files
    end
    # Parameters that must be an array of permitted values
    array_params = {}.tap do |result|
      result[:option_ids] = [] # MRQ answer
      result[:files_attributes] = [:id, :_destroy, :filename, :content] # Programming answer
    end
    scalar_params.push(array_params)
  end

  def answer_id_param
    params.permit(:answer_id)[:answer_id]
  end

  def edit_submission_path
    edit_course_assessment_submission_path(current_course, @assessment, @submission)
  end

  def submit_answer
    answer = @submission.answers.find(answer_id_param)

    if answer.update_attributes(submit_answer_params)
      if valid_for_grading?(answer)
        job = grade_and_reattempt_answer(answer)

        respond_to do |format|
          format.html { job ? redirect_to(job_path(job.job)) : redirect_to_edit }
          format.json { render json: { redirect_url: job ? job_path(job.job) : nil } }
        end
      else
        # TODO: Implement error recovery in the frontend. Code only goes here if user hacks the html
        # and enables the submit button.
        head :bad_request
      end
    else
      head :bad_request
    end
  end

  def grade_and_reattempt_answer(answer)
    # The transaction is to make sure that auto grading and job are present when the answer is in
    # the submitted state.
    answer.class.transaction do
      answer.finalise! if answer.attempting?
      # Only save if answer is graded in another server
      answer.save! unless answer.grade_inline?
      answer.auto_grade!(edit_submission_path, true)
    end
  end

  def unsubmit?
    params[:submission] && params[:submission][:unsubmit].present?
  end

  def redirect_to_edit
    if update_params[:finalise] && @submission.assessment.autograded?
      redirect_to edit_submission_path,
                  success: t('course.assessment.submission.submissions.update.finalise')
    else
      redirect_to edit_submission_path,
                  success: t('course.assessment.submission.submissions.update.success')
    end
  end

  # Test whether the answer can be graded or not.
  def valid_for_grading?(answer)
    return true unless answer.specific.is_a?(Course::Assessment::Answer::Programming)

    answer.specific.attempting_times_left > 0 || can?(:manage, @assessment)
  end
end
