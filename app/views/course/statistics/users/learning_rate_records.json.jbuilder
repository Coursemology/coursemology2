# frozen_string_literal: true
json.learningRateRecords @learning_rate_records do |record|
  json.id record.id
  json.learningRate record.learning_rate
  json.createdAt record.created_at.iso8601
end
