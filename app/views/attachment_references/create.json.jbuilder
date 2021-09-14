# frozen_string_literal: true
success = @attachment_reference&.persisted?

json.success success
json.id @attachment_reference.id if success
