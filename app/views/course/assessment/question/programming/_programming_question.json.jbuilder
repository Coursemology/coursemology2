# frozen_string_literal: true
json.partial! 'question'
json.partial! 'package_ui'
json.partial! 'import_result'

if @response
  json.partial! 'response', locals: { response: @response }
end
