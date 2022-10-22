# frozen_string_literal: true
json.id email.id
json.email email.email
json.isConfirmed email.confirmed?
json.isPrimary email.primary?
json.confirmationEmailPath send_confirmation_user_email_path(email) unless email.confirmed?
json.setPrimaryUserEmailPath set_primary_user_email_path(email) unless email.primary?
