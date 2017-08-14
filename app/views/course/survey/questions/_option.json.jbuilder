json.(option, :id, :weight)
json.option format_html(option.option)
unless option.attachment.nil?
  json.image_url option.attachment.url
  json.image_name option.attachment.name
end
