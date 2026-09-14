# frozen_string_literal: true
upgrades = local_assigns.fetch(:upgrades, @upgrades)

json.upgrades do
  json.array! upgrades do |upgrade|
    json.partial! 'upgrade', locals: { upgrade: upgrade }
  end
end

# Questions the request declined to act on, keyed by question id, so the client can report exactly
# which rows were skipped and why rather than failing the whole batch.
json.rejected(@rejected || {})
