# frozen_string_literal: true
# Sidekiq Cron configuration to invoke ConsolidatedItemEmailJob for opening reminder emails.
schedule_file = 'config/schedule.yml'

# Use Sidekiq Cron gem (https://github.com/ondrejbartas/sidekiq-cron) to
# invoke scheduled jobs.
#
# If you use a different job scheduler, edit this initializer with your preferred method of running
# cron jobs in Rails.
if Rails.env.production? && File.exist?(schedule_file) && Sidekiq.server?
  Sidekiq::Cron::Job.load_from_hash YAML.load_file(schedule_file)
end
