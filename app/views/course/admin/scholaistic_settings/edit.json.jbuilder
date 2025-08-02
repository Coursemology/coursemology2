# frozen_string_literal: true
json.assessmentsTitle @settings.assessments_title

if @ping_result
  json.pingResult do
    json.status @ping_result[:status]
    json.title @ping_result[:title]
    json.url @ping_result[:url]
  end
end
