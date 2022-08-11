# frozen_string_literal: true
json.codaveri_result do
  json.codaveri_id @programming_question.codaveri_id
  json.codaveri_status @programming_question.codaveri_status
  json.codaveri_message @programming_question.codaveri_message
  json.class @programming_question.codaveri_status == 200 ? 'alert alert-success' : 'alert alert-danger'
end
