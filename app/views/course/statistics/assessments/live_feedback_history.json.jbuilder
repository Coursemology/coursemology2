# frozen_string_literal: true

json.messages @messages.each do |message|
  json.id message.id
  json.content message.content
  json.createdAt message.created_at&.iso8601
  json.creatorId message.creator_id
  json.isError message.is_error

  json.files message.message_files.each do |message_file|
    file = message_file.file

    json.id file.id
    json.filename file.filename
    json.content file.content
    json.language @question.specific.language[:name]
    json.editorMode @question.specific.language.ace_mode
    json.highlightedContent highlight_code_block(file.content, @question.specific.language)
  end
end

json.question do
  json.id @question.id
  json.title @question.title
  json.description format_ckeditor_rich_text(@question.description)
end
