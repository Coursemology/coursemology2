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

# Create the default user account.
user = UserEmail.find_by_email('test@example.org')
unless user
  User.create!(email: 'test@example.org', password: 'Coursemology!', role: :administrator)
end
