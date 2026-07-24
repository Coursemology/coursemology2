# frozen_string_literal: true
RSpec.configure do |config|
  # Create a global stamper for this spec run.
  #
  # The stamper becomes the creator (and therefore the auto-built owner course_user) of courses
  # created in specs, and mail-sending specs deliver to that owner — so the stamper MUST own a
  # valid email. This suite commits without cleanup (use_transactional_fixtures is false, no
  # DatabaseCleaner), so if any spec removes the seeded admin's email it stays removed; the next
  # process's db:seed then recreates the admin as a *new* user, leaving the lowest-id human
  # (User.human_users.first) permanently without an email.
  #
  # Resolve the stamper by the seeded admin email (matching db/seeds and seed.rake) so it always
  # owns one, and do it in before(:suite) — this runs AFTER rails_helper's top-level db:seed, so
  # the admin email is guaranteed present even after such a recreation. (Setting it at file-load
  # time ran before db:seed and re-froze the stale, emailless user.) Fall back to the lowest-id
  # human only if that email is somehow absent.
  config.before(:suite) do
    ActsAsTenant.with_tenant(Instance.default) do
      User.stamper = User::Email.find_by_email('test@example.org')&.user || User.human_users.first
    end
  end
end
