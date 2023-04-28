# frozen_string_literal: true
json.packageUi do
  json.templates @programming_question.template_files do |file|
    json.id file.id
    json.filename file.filename
    json.content format_code_block(file.content, @programming_question.language)
  end

  json.testCases do
    json.partial! 'test_cases', type: :public, test_cases: @public_test_cases
    json.partial! 'test_cases', type: :private, test_cases: @private_test_cases
    json.partial! 'test_cases', type: :evaluation, test_cases: @evaluation_test_cases
  end
end
