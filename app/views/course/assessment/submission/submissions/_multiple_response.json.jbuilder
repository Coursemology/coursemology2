question = answer.question.specific

json.options question.options do |option|
  json.option format_html(option.option)
  json.id option.id
end

json.option_ids answer.options.map(&:id)
