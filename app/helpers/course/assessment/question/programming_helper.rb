# frozen_string_literal: true
module Course::Assessment::Question::ProgrammingHelper
  # Displays the result alert for an import job.
  #
  # @return [String] If there is an import job for the question.
  # @return [nil] If there is no import job for the question.
  def import_result_message
    import_job = @programming_question.import_job
    return nil unless import_job

    if import_job.completed?
      successful_import_message
    elsif import_job.errored?
      errored_import_message
    end
  end

  # Checks if the import job errored.
  #
  # @return [Boolean]
  def import_errored?
    !@programming_question.import_job.nil? && @programming_question.import_job.errored?
  end

  # Determines if the build log should be displayed.
  #
  # @return [Boolean]
  def display_build_log?
    import_errored? &&
      @programming_question.import_job.error['class'] ==
        Course::Assessment::ProgrammingEvaluationService::Error.name
  end

  def validation_errors
    return nil if @programming_question.errors.empty?

    @programming_question.errors.full_messages.to_sentence
  end

  def check_import_job?
    @programming_question.import_job && @programming_question.import_job.status != 'completed'
  end

  def can_switch_package_type?
    params[:action] == 'new' || params[:action] == 'create'
  end

  def can_edit_online?
    return true if params[:action] == 'new'

    @meta.present?
  end

  private

  def successful_import_message
    t('course.assessment.question.programming.form.import_result.success')
  end

  def errored_import_message
    t('course.assessment.question.programming.form.import_result.error',
      error: import_error_message(@programming_question.import_job.error))
  end

  # Translates an error object serialised in the +TrackableJobs+ table to a user-readable message.
  #
  # @param [Hash] error The error object in the +TrackableJobs+ table.
  # @return [String]
  def import_error_message(error)
    case error['class']
    when InvalidDataError.name
      t('course.assessment.question.programming.form.import_result.errors.invalid_package')
    when Timeout::Error.name
      t('course.assessment.question.programming.form.import_result.errors.evaluation_timeout')
    when Course::Assessment::ProgrammingEvaluationService::TimeLimitExceededError.name
      t('course.assessment.question.programming.form.import_result.errors.time_limit_exceeded')
    when Course::Assessment::ProgrammingEvaluationService::Error.name
      t('course.assessment.question.programming.form.import_result.errors.evaluation_error')
    else
      error['message']
    end
  end
end
