# frozen_string_literal: true
module Course::Assessment::Question::ProgrammingHelper
  # Displays the result alert for an import job.
  #
  # @return [String] If there is an import job for the question.
  # @return [nil] If there is no import job for the question.
  def import_result_alert(json: false)
    import_job = @programming_question.import_job

    return json ? {} : nil unless import_job

    if import_job.completed?
      successful_import_alert(json: json)
    elsif import_job.errored?
      errored_import_alert(json: json)
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

  # Determines if the programming question errors should be displayed.
  #
  # @return [Boolean]
  def display_validation_errors?
    @programming_question.errors.present?
  end

  # Displays the validation errors alert for programming question.
  #
  # @return [String] If there are validation errors for the question.
  # @return [nil] If there are no validation errors for the question.
  def validation_errors_alert
    return nil if @programming_question.errors.empty?

    content_tag(:div, class: ['alert', 'alert-danger']) do
      messages = @programming_question.errors.full_messages.map do |message|
        content_tag(:div, message)
      end

      safe_join messages
    end
  end

  def check_import_job?
    @programming_question.import_job && @programming_question.import_job.status != 'completed'
  end

  def display_autograded_toggle?
    @programming_question.edit_online? || can_switch_package_type?
  end

  def can_switch_package_type?
    params[:action] == 'new' || params[:action] == 'create'
  end

  def can_edit_online?
    return true if params[:action] == 'new'

    @meta.present?
  end

  private

  def successful_import_alert(json: false)
    klass = ['alert', 'alert-success']
    message = t('course.assessment.question.programming.form.import_result.success')

    if json
      { class: klass.join(' '), message: message }
    else
      content_tag(:div, class: klass) do
        message
      end
    end
  end

  def errored_import_alert(json: false)
    klass = ['alert', 'alert-danger']
    message = t('course.assessment.question.programming.form.import_result.error',
                error: import_error_message(@programming_question.import_job.error))

    if json
      { class: klass.join(' '), message: message }
    else
      content_tag(:div, class: klass) do
        message
      end
    end
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
