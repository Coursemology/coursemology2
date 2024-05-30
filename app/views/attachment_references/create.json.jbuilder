# frozen_string_literal: true
success = @attachment_reference&.persisted?

json.success success
if success
  json.id @attachment_reference.id
  json.attachmentUrl @attachment_reference.generate_public_url
end
