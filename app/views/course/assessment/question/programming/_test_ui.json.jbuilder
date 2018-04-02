# frozen_string_literal: true
if @meta
  json.test_ui do
    json.mode @meta[:editor_mode]
    json.set! @meta[:editor_mode], @meta[:data]
  end
else
  json.set! :test_ui, {}
end
