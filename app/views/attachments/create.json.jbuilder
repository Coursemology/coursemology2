# frozen_string_literal: true
json.success !@attachment.nil?

if @attachment
  json.url @attachment.url
  json.id @attachment.id
end
