# frozen_string_literal: true

if Rails.env.production?
  class ApplicationJob < ActiveJob::Base
    include Rollbar::ActiveJob
  end
end
