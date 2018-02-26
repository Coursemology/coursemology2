# frozen_string_literal: true
module TimeZoneConcern
  extend ActiveSupport::Concern

  def self.included(base)
    base.class_eval { validates_with TimeZoneValidator }
  end

  # Override ActiveRecord's default time_zone getter method.
  #
  # If time_zone for model is not set, default it to Application Default.
  # If time_zone for model is set and invalid, default to Application Default.
  # If time_zone for model is set and valid, return model set time_zone.
  #
  # @return [String] time_zone to be applied on model.
  def time_zone
    if self[:time_zone] && ActiveSupport::TimeZone[self[:time_zone]].present?
      self[:time_zone]
    else
      Application.config.x.default_user_time_zone
    end
  end
end
