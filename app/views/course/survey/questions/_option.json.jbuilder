json.(option, :id, :option, :weight)
unless option.attachment.nil?
  json.image_url option.attachment.url
  json.image_name option.attachment.name
end
