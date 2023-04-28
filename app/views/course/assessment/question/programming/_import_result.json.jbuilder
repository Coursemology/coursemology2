# frozen_string_literal: true
json.importResult do
  status = if import_job.completed?
             'success'
           elsif import_job.errored?
             'error'
           end

  json.status status if status.present?

  if display_build_log?
    json.buildLog do
      log = @programming_question.import_job.error.slice('stdout', 'stderr')
      json.stdout log['stdout']
      json.stderr log['stderr']
    end
  end

  json.importResultMessage import_result_message if import_job
end
