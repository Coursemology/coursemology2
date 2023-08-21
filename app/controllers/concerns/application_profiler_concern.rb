# frozen_string_literal: true
module ApplicationProfilerConcern
  extend ActiveSupport::Concern

  included do
    before_action :enable_miniprofiler
  end

  def enable_miniprofiler
    Rack::MiniProfiler.authorize_request if Rails.env.production? && current_user&.administrator?
  end
end
