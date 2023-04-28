# frozen_string_literal: true
json.testUi do
  mode = @meta[:editor_mode]
  json.mode mode
  json.metadata do
    json.partial! "course/assessment/question/programming/metadata/#{mode}", data: @meta[:data].deep_symbolize_keys
  end
end
