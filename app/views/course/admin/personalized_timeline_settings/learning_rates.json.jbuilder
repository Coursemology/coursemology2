# frozen_string_literal: true
json.learningRateRecords @records do |record|
  json.id record[0]
  json.records record[1] do |learning_rate_record|
    json.createdAt learning_rate_record.created_at.iso8601
    json.learningRate learning_rate_record.learning_rate
  end
end
