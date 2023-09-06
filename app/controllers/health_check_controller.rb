# frozen_string_literal: true

class HealthCheckController < ActionController::Base
  rescue_from(Exception) { head :service_unavailable }

  def show
    head :ok
  end
end
