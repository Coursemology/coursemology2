# frozen_string_literal: true
module ApplicationUserTimeZoneConcern
  extend ActiveSupport::Concern

  included do
    around_action :set_time_zone, if: :current_user
  end

  protected

  # Set the time_zone for current request.
  def set_time_zone(&block) # rubocop:disable Naming/AccessorMethodName
    Time.use_zone(current_user.time_zone, &block)
  end
end
