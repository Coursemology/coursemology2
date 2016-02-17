module Course::Assessment::Question::ProgrammingHelper
  # Displays the result alert for an import job.
  #
  # @return [String] If there is an import job for the question.
  # @return [nil] If there is no import job for the question.
  def import_result_alert
    import_job = @programming_question.import_job
    return nil unless import_job

    if import_job.completed?
      successful_import_alert
    elsif import_job.errored?
      errored_import_alert
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

  private

  def successful_import_alert
    content_tag(:div, class: ['alert', 'alert-success']) do
      t('course.assessment.question.programming.form.import_result.success')
    end
  end

  def errored_import_alert
    content_tag(:div, class: ['alert', 'alert-danger']) do
      t('course.assessment.question.programming.form.import_result.error',
        error: import_error_message(@programming_question.import_job.error))
    end
  end

  # Translates an error object serialised in the +TrackableJobs+ table to a user-readable message.
  #
  # @param [Hash] error The error object in the +TrackableJobs+ table.
  # @return [String]
  def import_error_message(error) # rubocop:disable Metrics/MethodLength
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
