# frozen_string_literal: true
json.package_ui do
  json.templates @programming_question.template_files do |file|
    json.(file, :id, :filename)
    json.content format_code_block(file.content, @programming_question.language)
  end

  json.test_cases do
    json.public @programming_question.test_cases.select(&:public_test?).as_json
    json.private @programming_question.test_cases.select(&:private_test?).as_json
    json.evaluation @programming_question.test_cases.select(&:evaluation_test?).as_json
  end
end
