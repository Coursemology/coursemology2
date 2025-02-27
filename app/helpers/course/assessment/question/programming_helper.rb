# frozen_string_literal: true
module Course::Assessment::Question::ProgrammingHelper
  # Displays a specific error type for an import job, for frontend to map to an appropriate error message.
  #
  # @return [String] If the import job for the question exists and raised an error.
  # @return [nil] If the import job for the question succeded, or does not exist.
  def import_result_error
    return nil unless import_errored?

    case @programming_question.import_job.error['class']
    when InvalidDataError.name
      :invalid_package
    when Timeout::Error.name
      :evaluation_timeout
    when Course::Assessment::ProgrammingEvaluationService::TimeLimitExceededError.name
      :time_limit_exceeded
    when Course::Assessment::ProgrammingEvaluationService::Error.name
      :evaluation_error
    else
      :generic_error
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
end
