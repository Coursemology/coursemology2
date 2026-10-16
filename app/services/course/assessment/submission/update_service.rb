# frozen_string_literal: true
class Course::Assessment::Submission::UpdateService < SimpleDelegator
  include Course::Assessment::Answer::UpdateAnswerConcern

  def update
    if update_submission
      load_or_create_answers if unsubmit?
      render 'edit'
    else
      logger.error("failed to update submission: #{@submission.errors.inspect}")
      render json: { errors: @submission.errors }, status: :bad_request
    end
  end

  def load_or_create_answers
    return unless @submission.attempting?

    new_answers_created = @submission.create_new_answers
    @submission.answers.reload if new_answers_created && @submission.answers.loaded?
  end

  def load_or_create_submission_questions
    return unless create_missing_submission_questions && @submission.submission_questions.loaded?

    @submission.submission_questions.reload
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

  def update_answers_params
    params.require(:submission)['answers']
  end

  def update_submission_params
    params.require(:submission).permit(*workflow_state_params, points_awarded_param)
  end

  def update_submission_additional_params
    params.require(:submission).permit(:is_save_draft)
  end

  private

  # The permitted state changes that will be provided to the model.
  def workflow_state_params
    result = []
    result << :finalise if can?(:update, @submission)
    result.push(:publish, :mark, :unmark, :unsubmit) if can?(:grade, @submission)
    result
  end

  # Permit the accurate points_awarded column field based on submission's workflow state.
  def points_awarded_param
    @submission.published? ? :points_awarded : :draft_points_awarded
  end

  # Find the questions for this submission without submission_questions.
  # Build and save new submission_questions.
  #
  # @return[Boolean] If new submission_questions were created.
  def create_missing_submission_questions
    questions_with_submission_questions = @submission.submission_questions.includes(:question).map(&:question)
    questions_without_submission_questions = questions_to_attempt - questions_with_submission_questions
    new_submission_questions = []
    questions_without_submission_questions.each do |question|
      new_submission_questions <<
        Course::Assessment::SubmissionQuestion.new(submission: @submission, question: question)
    end

    import_success = true
    begin
      # NOTE: "import" method from activerecord-import for some reason does not return boolean
      #  and always raise an error even without using "import!""
      Course::Assessment::SubmissionQuestion.import new_submission_questions, recursive: true
    rescue StandardError
      import_success = false
    end

    import_success && new_submission_questions.any?
  end

  def questions_to_attempt
    @questions_to_attempt ||= @submission.questions
  end

  def update_submission
    @submission.class.transaction do
      update_answers unless unsubmit? || unmark?

      unless submittable? && @submission.update(update_submission_params)
        logger.error("Failed to update submission #{@submission.errors.inspect}")
        raise ActiveRecord::Rollback
      end

      true
    end
  end

  # Applies the answer updates sent with the submission. A failed update rolls back the enclosing
  # transaction in update_submission.
  def update_answers
    update_answers_params&.each do |answer_params|
      next if !answer_params.is_a?(ActionController::Parameters) || answer_params[:id].blank?

      answer = @submission.answers.includes(:actable).find { |a| a.id == answer_params[:id].to_i }

      next unless answer && !update_answer(answer, answer_params)

      logger.error("Failed to update answer #{answer.errors.inspect}")
      answer.errors.messages.each do |attribute, message|
        @submission.errors.add(attribute, message)
      end
      raise ActiveRecord::Rollback
    end
  end

  def unsubmit?
    params[:submission] && params[:submission][:unsubmit].present?
  end

  def finalise?
    params[:submission] && params[:submission][:finalise].present?
  end

  # A voice recording saved before the size limit existed is kept through unsubmission, but must be
  # replaced before the submission is submitted again. Checked after this request's answer updates, so a
  # replacement uploaded with the submission counts.
  #
  # This lives here rather than in the model so it applies only when someone submits through the page:
  # forced submission (Submission#force_submit! at the deadline, and ForceSubmittingJob, which finalises
  # every selected submission in one transaction) must still go through.
  def submittable?
    return true unless finalise?

    @submission.current_answers.each do |answer|
      next unless answer.actable_type == Course::Assessment::Answer::VoiceResponse.name
      next unless answer.specific.file_too_large?

      question_assessment = @assessment.question_assessments.find_by(question: answer.question)
      @submission.errors.add(:base, :voice_response_too_large, question: question_assessment&.display_title)
    end
    @submission.errors.empty?
  end

  def unmark?
    params[:submission] && params[:submission][:unmark].present?
  end

  def reattempt_answer(answer, finalise: true)
    new_answer = answer.question.attempt(answer.submission, answer)
    new_answer.finalise! if finalise
    new_answer.save!
    new_answer
  end
end
