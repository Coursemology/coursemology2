# frozen_string_literal: true
sorted_emails = @emails.order(:confirmed_at).to_a

json.emails sorted_emails do |email|
  json.partial! 'email_list_data', email: email
end
