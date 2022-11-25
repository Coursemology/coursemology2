# frozen_string_literal: true
json.id role_request.id
json.name role_request.user.name
json.email role_request.user.email
json.organization role_request.organization
json.designation role_request.designation
json.role role_request.role
json.reason format_ckeditor_rich_text(role_request.reason)
json.status role_request.workflow_state
json.createdAt role_request.created_at
json.confirmedBy role_request.confirmer.name unless role_request.pending?
json.confirmedAt role_request.confirmed_at unless role_request.pending?
json.rejectionMessage role_request.rejection_message || '-' if role_request.rejected?
