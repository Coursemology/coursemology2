# frozen_string_literal: true
# Enables rack_mini_profiler for all requests in production
# For use in our own staging environment, where RAILS_ENV=production

Rails.application.config.after_initialize do
  ApplicationController.class_eval do
    before_action :enable_miniprofiler

    def enable_miniprofiler
      return unless current_user&.administrator?

      Rack::MiniProfiler.authorize_request
    end
  end
end
