json.success !@attachment.nil?

if @attachment
  json.url @attachment.url
  json.id @attachment.id
end
