# frozen_string_literal: true
class Course::Assessment::Submission::UpdateService < SimpleDelegator
  def update
    if @submission.update_attributes(update_params)
      redirect_to edit_course_assessment_submission_path(current_course, @assessment, @submission),
                  success: t('course.assessment.submission.submissions.update.success')
    else
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
    @update_params ||= begin
      params.require(:submission).permit(
        *workflow_state_params,
        answers_attributes: [:id] + update_answers_params
      )
    end
  end

  private

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
end
