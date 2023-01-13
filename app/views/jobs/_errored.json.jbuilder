# frozen_string_literal: true
json.status job.status
json.message t('.errored')
json.errorMessage job.error['message'] if job.error
