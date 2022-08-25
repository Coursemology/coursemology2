# frozen_string_literal: true
json.status 'errored'
json.message t('.errored')
# Show codaveri error for question management
json.detailed_message @job.error['message'] if @job.error && @job.error['class'] == 'CodaveriError'
