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
Instance.find_or_initialize_by(name: 'Default', host: '*').save!(validate: false)

ActsAsTenant.with_tenant(Instance.default) do
  # Create the Coursemology system account.
  user = User.exists?(User::SYSTEM_USER_ID)
  unless user
    User.new(id: User::SYSTEM_USER_ID, name: 'System').save!(validate: false)
  end

  # Create the default user account.
  user = User::Email.find_by_email('test@example.org')
  unless user
    user = User.new(name: 'Administrator', email: 'test@example.org',
                    password: 'Coursemology!', role: :administrator)
    user.skip_confirmation!
    user.save!
  end
end
