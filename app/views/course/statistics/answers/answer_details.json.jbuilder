# frozen_string_literal: true
json.question do
  json.id @question.id
  json.title @question.title
  json.description format_ckeditor_rich_text(@question.description)
end
