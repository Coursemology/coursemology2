json.files answer.files do |file|
  json.(file, :id, :filename, :content)
end
