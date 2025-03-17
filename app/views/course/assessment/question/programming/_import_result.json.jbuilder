# frozen_string_literal: true
import_job = @programming_question.import_job
json.importResult do
  status = if import_job.completed?
             'success'
           elsif import_job.errored?
             'error'
           end

  json.status status if status.present?

  if display_build_log?
    json.buildLog do
      log = import_job.error.slice('stdout', 'stderr')
      json.stdout log['stdout']
      json.stderr log['stderr']
    end
  end

  if import_errored?
    json.error import_result_error
    json.message import_job.error['message']
  end
end
