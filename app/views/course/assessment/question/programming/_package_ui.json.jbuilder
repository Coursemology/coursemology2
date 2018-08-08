# frozen_string_literal: true
json.programmingPackage do
  json.templates @programming_question.template_files do |file|
    json.(file, :id, :filename)
    json.content format_code_block(file.content, @programming_question.language)
  end

  json.testCases do
    json.public @programming_question.test_cases.select(&:public_test?)
    json.private @programming_question.test_cases.select(&:private_test?)
    json.evaluation @programming_question.test_cases.select(&:evaluation_test?)
  end
end
