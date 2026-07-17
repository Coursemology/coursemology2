# frozen_string_literal: true
json.gradingScheme question.grading_scheme
json.options question.options do |option|
  json.id option.id
  json.option format_ckeditor_rich_text(option.option)
  json.correct option.correct
  json.explanation format_ckeditor_rich_text(option.explanation)
  json.weight option.weight
end
