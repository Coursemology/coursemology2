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

  def update_submission # rubocop:disable Metrics/AbcSize, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity, Metrics/MethodLength
    @submission.class.transaction do
      unless unsubmit? || unmark?
        update_answers_params&.each do |answer_params|
          next if !answer_params.is_a?(ActionController::Parameters) || answer_params[:id].blank?

          answer = @submission.answers.includes(:actable).find { |a| a.id == answer_params[:id].to_i }

          if answer && !update_answer(answer, answer_params)
            logger.error("Failed to update answer #{answer.errors.inspect}")
            answer.errors.messages.each do |attribute, message|
              @submission.errors.add(attribute, message)
            end
            raise ActiveRecord::Rollback
          end
        end
      end

      unless @submission.update(update_submission_params)
        logger.error("Failed to update submission #{@submission.errors.inspect}")
        raise ActiveRecord::Rollback
      end

      true
    end
  end

  def attempt_draft_answer(answer)
    return unless answer

    reattempt_answer(answer, finalise: false) if should_attempt_draft_answer?(answer)
  end

  def should_attempt_draft_answer?(answer)
    is_save_draft = update_submission_additional_params[:is_save_draft].to_s.downcase == 'true'
    is_programming = answer.actable_type == Course::Assessment::Answer::Programming.name
    assessment_save_draft_answer = @assessment.allow_record_draft_answer

    is_save_draft && is_programming && assessment_save_draft_answer
  end

  def unsubmit?
    params[:submission] && params[:submission][:unsubmit].present?
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
