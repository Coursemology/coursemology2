# frozen_string_literal: true
json.(option, :id, :weight)
json.option format_ckeditor_rich_text(option.option)
unless option.attachment.nil?
  json.image_url option.attachment.url
  json.image_name option.attachment.name
end
