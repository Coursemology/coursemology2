# frozen_string_literal: true
json.instance do
  json.id current_tenant.id
  json.name current_tenant.name
  json.host current_tenant.host
end
