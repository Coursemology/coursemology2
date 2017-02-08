json.(option, :id, :option, :weight)
unless option.image.file.nil?
  json.image_url option.image.url
  json.image_name option.image.file.original_filename
end
