json.languageName question.language&.name
json.memoryLimit question.memory_limit
json.timeLimit question.time_limit

json.templateFiles question.template_files do |file|
  json.filename file.filename
  json.content file.content
end

grouped = question.test_cases.group_by(&:test_case_type)
{ 'publicTestCases' => 'public_test',
  'privateTestCases' => 'private_test',
  'evaluationTestCases' => 'evaluation_test' }.each do |key, type|
  json.set! key, (grouped[type] || []) do |tc|
    json.identifier tc.identifier
    json.expression tc.expression
    json.expected tc.expected
    json.hint tc.hint
  end
end