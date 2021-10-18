# frozen_string_literal: true
class Course::Assessment::Submission::UpdateService < SimpleDelegator
  def update
    if update_submission
      load_or_create_answers if unsubmit?
      render 'edit'
    else
      logger.error("failed to update submission: #{@submission.errors.inspect}")
      render json: { errors: @submission.errors }, status: :bad_request
    end
  end

  def submit_answer
    answer = @submission.answers.find(submit_answer_params[:id].to_i)
    if update_answer(answer, submit_answer_params)
      if should_auto_grade_on_submit(answer)
        auto_grade(answer)
      else
        render answer
      end
    else
      logger.error("failed to save answer: #{answer.errors.inspect}")
      render json: { errors: answer.errors }, status: :bad_request
    end
  end

  def should_auto_grade_on_submit(answer)
    mcq = [I18n.t('course.assessment.question.multiple_responses.question_type.multiple_response'),
           I18n.t('course.assessment.question.multiple_responses.question_type.multiple_choice')]

    !mcq.include?(answer.question.question_type) || @submission.assessment.show_mcq_answer
  end

  def load_or_create_answers
    return unless @submission.attempting?

    new_answers = questions_to_attempt.not_answered(@submission).attempt(@submission)
    new_answers_created = new_answers.map do |answer|
      # When there are no existing answers, the first one will be the current_answer.
      if answer.new_record?
        answer.current_answer = true
        answer.save!
      end
    end
    new_answers_created = new_answers_created.reduce(false) { |acc, elem| acc || elem }
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

  def update_submission_params
    params.require(:submission).permit(*workflow_state_params, points_awarded_param)
  end

  def update_answers_params
    params.require(:submission).permit(answers: [:id] + update_answer_params)
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

  # The permitted parameters for answers and their specific answer types.
  #
  # This varies depending on the permissions of the user.
  def update_answer_params
    [].tap do |result|
      result.push(*update_answer_type_params) if can?(:update, @submission)
      result.push(:grade) if can?(:grade, @submission) && !@submission.attempting?
    end
  end

  # The permitted parameters for each kind of answer.
  def update_answer_type_params
    scalar_params = [].tap do |result|
      result.push(:answer_text) # Text response answer
      result.push(attachments_params) # User uploaded files
    end
    # Parameters that must be an array of permitted values
    array_params = {}.tap do |result|
      result[:option_ids] = [] # MRQ answer
      result[:files_attributes] = [:id, :_destroy, :filename, :content] # Programming answer
      forum_post_attributes = [:id, :text, :creatorId, :updatedAt]
      result[:selected_postpacks] = [corePost: forum_post_attributes, parentPost: forum_post_attributes, topic: [:id]] # Forum Post Response answer
    end
    scalar_params.push(array_params)
  end

  def submit_answer_params
    params.require(:answer).permit([:id] + update_answer_type_params)
  end

  def questions_to_attempt
    @questions_to_attempt ||= @submission.assessment.questions
  end

  # Find the questions for this submission without submission_questions.
  # Build and save! new submission_questions.
  #
  # @raise [ActiveRecord::RecordInvalid] If the new submission_questions cannot be saved.
  # @return[Boolean] If new submission_questions were created.
  def create_missing_submission_questions
    questions_with_submission_questions = @submission.submission_questions.map(&:question)
    questions_without_submission_questions = questions_to_attempt - questions_with_submission_questions
    new_submission_questions = []
    questions_without_submission_questions.each do |question|
      new_submission_questions <<
        @submission.submission_questions.build(question: question)
    end
    new_submission_questions.each(&:save!)

    new_submission_questions.any?
  end

  def update_submission
    @submission.class.transaction do
      unless unsubmit? || unmark?
        update_answers_params[:answers]&.each do |answer_params|
          next if answer_params[:id].blank?

          answer = @submission.answers.includes(:actable).find { |a| a.id == answer_params[:id].to_i }
          if answer && !update_answer(answer, answer_params)
            logger.error("failed to update answer #{answer.errors.inspect}")
            raise ActiveRecord::Rollback
          end
        end
      end

      @submission.update(update_submission_params)
    end
  end

  def update_answer(answer, answer_params)
    specific_answer = answer.specific
    specific_answer.assign_params(answer_params)
    answer.save
  end

  def unsubmit?
    params[:submission] && params[:submission][:unsubmit].present?
  end

  def unmark?
    params[:submission] && params[:submission][:unmark].present?
  end

  def auto_grade(answer)
    return unless valid_for_grading?(answer)

    job = reattempt_and_grade_answer(answer)
    if job
      render json: { redirect_url: job_path(job.job) }
    else
      # Render the current_answer.
      render answer
    end
  end

  # Returns all answers for the same question as `current_answer` where the
  # autograding job has failed.
  #
  # @param [Course::Assessment::Answer] current_answer The Course::Assessment::Answer for a
  #   question where current_answer is set to true.
  # @return [Array<Course::Assessment::Answer>] An array containing answers with errored jobs.
  def errored_answers(current_answer)
    attempts = current_answer.submission.answers.from_question(current_answer.question_id)
    attempts.select do |attempt|
      attempt&.auto_grading&.job&.errored?
    end
  end

  def reattempt_and_grade_answer(answer)
    # The transaction is to make sure that the new attempt, auto grading and job are present when
    # the current answer is submitted.
    #
    # If the latest answer has an errored job, the user may still modify current_answer before
    # grading again. Failed autograding jobs should not count towards their answer attempt limit,
    # so destroy the failed job answer and re-grade the current entry.
    answer.class.transaction do
      last_answer = answer.submission.answers.select { |ans| ans.question_id == answer.question_id }.last
      last_answer.destroy! if last_answer&.auto_grading&.job&.errored?
      new_answer = answer.question.attempt(answer.submission, answer)
      new_answer.finalise!
      new_answer.save!
      new_answer.auto_grade!(redirect_to_path: nil, reduce_priority: false)
    end
  end

  # Test whether the answer can be graded or not.
  def valid_for_grading?(answer)
    return true if @assessment.autograded?
    return true unless answer.specific.is_a?(Course::Assessment::Answer::Programming)

    answer.specific.attempting_times_left > 0 || can?(:manage, @assessment)
  end
end
