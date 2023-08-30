# frozen_string_literal: true

class HealthCheckController < ApplicationController
  rescue_from(Exception) { head :service_unavailable }

  def show
    head :ok
  end

  protected

  def publicly_accessible?
    true
  end
end
