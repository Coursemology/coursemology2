# frozen_string_literal: true
json.codaveriResult do
  json.id @programming_question.codaveri_id
  json.status @programming_question.codaveri_status == 200 ? 'success' : 'error'
  json.message @programming_question.codaveri_message
end
