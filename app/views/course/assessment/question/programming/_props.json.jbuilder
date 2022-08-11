# frozen_string_literal: true
json.partial! 'question'
json.partial! 'package_ui'
json.partial! 'test_ui'
json.partial! 'import_result'
json.partial! 'codaveri_result' if @programming_question.is_codaveri

json.partial! 'response', locals: { response: @response } if @response
