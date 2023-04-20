# frozen_string_literal: true
json.status job.status
json.message t('.errored')
json.errorMessage job_error_message(job.error)
