# frozen_string_literal: true

json.emails @emails do |email|
  json.partial! 'email_list_data', email: email
end
