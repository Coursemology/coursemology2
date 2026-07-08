# frozen_string_literal: true
if Rails.env.production?
  require 'rollbar'

  Rails.application.config.to_prepare do
    ApplicationJob.include(Rollbar::ActiveJob)
  end
end
