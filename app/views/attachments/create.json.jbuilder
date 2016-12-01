json.success !@attachment.nil?

if @attachment
  json.url @attachment.url
  json.name @attachment.name
end
