# frozen_string_literal: true
# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
#
# Remember to ensure that the commands in this file are idempotent!

# Default hostname without validation and cannot be changed in UI
Instance.find_or_initialize_by(id: Instance::DEFAULT_INSTANCE_ID, name: 'Default', host: '*').
  save!(validate: false)

ActsAsTenant.with_tenant(Instance.default) do
  # Create the Coursemology built in accounts.
  User.create!(id: User::SYSTEM_USER_ID, name: 'System') unless User.exists?(User::SYSTEM_USER_ID)
  User.create!(id: User::DELETED_USER_ID, name: 'Deleted') unless User.exists?(User::DELETED_USER_ID)
end

load(Rails.root.join('db', 'seeds', "#{Rails.env.downcase}.rb"))
