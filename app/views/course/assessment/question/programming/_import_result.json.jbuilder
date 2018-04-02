# frozen_string_literal: true
json.import_result do
  json.alert import_result_alert(json: true)

  if display_build_log?
    json.build_log do
      log = @programming_question.import_job.error.slice('stdout', 'stderr')
      json.stdout log['stdout']
      json.stderr log['stderr']
    end
  end

  json.import_errored import_errored?
end
