# frozen_string_literal: true
json.responseId @response.id
json.canModify can?(:modify, @response)
json.canSubmit can?(:submit, @response)
