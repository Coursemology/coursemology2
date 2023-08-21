# frozen_string_literal: true

# Use build process to move this into config/initializers
# Enables rack_mini_profiler for all requests in production
# For use in our own staging environment, where RAILS_ENV=production

if Rails.env.production?
  Rails.application.config.after_initialize do
    ApplicationController.class_eval do
      before_action :enable_miniprofiler

      def enable_miniprofiler
        Rack::MiniProfiler.authorize_request if current_user&.administrator?
      end
    end
  end
end
