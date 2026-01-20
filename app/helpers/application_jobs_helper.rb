# frozen_string_literal: true

module ApplicationJobsHelper
  def job_error_message(error)
    return nil unless error

    case error['class']
    when Docker::Error::ConflictError.name
      I18n.t('errors.course.assessment.answer.programming_auto_grading.job.failure.time_limit_breached')
    when Timeout::Error.name
      I18n.t('errors.course.assessment.answer.programming_auto_grading.job.failure.timeout_error')
    when Docker::Error::TimeoutError
      I18n.t('errors.course.assessment.answer.programming_auto_grading.job.failure.container_unreachable')
    else
      I18n.t('errors.course.assessment.answer.programming_auto_grading.job.failure.generic_error',
             error: error['message'])
    end
  end
end
